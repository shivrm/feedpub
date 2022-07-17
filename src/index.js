import Parser from "rss-parser";
import Epub from "epub-gen";
import read from "node-readability";
import toml from "toml";

import fs from "fs";

// Used for comparing strings during sorting
function order(a, b) {
	if (a < b) {
		return -1
	} else if (a == b) {
		return 0
	} else if (a > b) {
		return 1
	}
}

// Converts all relative links in an HTML string into absolute links
function relToAbs(baseUrl, html) {
	// Matches HTML tags with an src or href attribute containing a link
	// that does not start with 'http'
	const regex = /<(.*?)(src|href)=\"(?!http)(.*?)\"(.*?)>/g;

	return (html ?? "").replace(regex, (match, p1, p2, p3, p4, offset, string) => {
		// Replaces p3 (the relative URL) with an absolute URL
		let url = new URL(p3, baseUrl).href;
		return `<${p1}${p2}="${url}"${p4}>`
	})
}

let config = fs.readFileSync('config.toml', {encoding: 'utf8', flag: 'r'})
config = toml.parse(config)
	
const parser = new Parser({
	customFields: {
		feed: ['author']
	}
});

let items = [];
let totalItemCount = 0;

let titles = [], authors = [];

for (const source of config.sources) {

	let feed = await parser.parseURL(source.url);

	// Title and author specified in `config.toml` will override feed title
	let title = source?.title ?? feed?.title ?? "No Title"
	titles.push(title);

	// Atom feeds will have author's name as `feed.author.name`, while others
	// use `feed.author`.
	let author = source?.author ?? feed?.author?.name ?? feed?.author ?? "Unknown Author";
	authors.push(author);

	let sourceItemCount = source?.count ?? feed.items.length;
	totalItemCount += sourceItemCount;
	
	console.log(`[Reading] ${sourceItemCount} item(s) from ${title} by ${author}`)

	// Orders the items based on chronological order.
	let sourceItems = feed.items.sort((a, b) => order(a.pubDate, b.pubDate));
	// Keep only the last `sourceItemCount` items.
	sourceItems = sourceItems.slice(-sourceItemCount);

	for (const item of sourceItems) {
		if (source.extract) {
			// Use `node-readability` to extract content if specified. It also converts all
			// links to absolute links.
			read(item.link, function(err, article) {
				items.push({title: article.title, data: article.content, author: author, pubDate: Date.parse(item.pubDate)});
			})
		} else {
			// Otherwise just use the content given in the feed.
			// Relative links will be replaced with absolute links.
			items.push({title: item.title, data: relToAbs(feed.link, item.content), author: author, pubDate: Date.parse(item.pubDate)})
		}
	}
}

// Since `feed-parser` uses callbacks, wait till all items have been processed
// This loop will check and log the status every second.
while (items.length < totalItemCount) {
	await new Promise(res => setTimeout(res, 1000));
	console.log(`Processed ${items.length} items out of ${totalItemCount}`)
}

// If the `order` property is specifies in the config, then order the items
switch (config?.order) {
	case undefined:
	case "none":
		break;

	case "date":
		items = items.sort((a, b) => order(a.pubDate, b.pubDate))
		break;
	
	case "title":
		items = items.sort((a, b) => order(a.title.toLowerCase(), b.title.toLowerCase()))
		break;

	case "length":
		items = items.sort((a, b) => a.data.length - b.data.length)
		break;

	default:
		throw new Error("Invalid value for order - must be 'date', 'title', 'length', or 'none'")
}

// Create the ebook. This will also download any images referenced in the content.
new Epub({
	title: titles.toString(),
	author: authors,
	output: config.output,
	content: items
}).promise.then(
	() => console.log("Success"),
	err => console.log(`Error: {err}`)
)
