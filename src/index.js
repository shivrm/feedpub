import Parser from "rss-parser";
import Epub from "epub-gen";
import read from "node-readability";
import toml from "toml";

import fs from "fs";

function order(a, b) {
	if (a < b) {
		return -1
	} else if (a == b) {
		return 0
	} else if (a > b) {
		return 1
	}
}

function relToAbs(baseUrl, html) {
	const regex = /<(.*?)(src|href)=\"(?!http)(.*?)\"(.*?)>/g;
	return html.replace(regex, (match, p1, p2, p3, p4, offset, string) => {
		let url = new URL(p3, baseUrl).href;
		return `<${p1}${p2}="${url}"${p4}>`
	})
}

let config = fs.readFileSync('sources.toml', {encoding: 'utf8', flag: 'r'})
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
	
	let title = source?.title || feed?.title || "No Title"
	titles.push(title);

	let author = source?.author || feed?.author?.name || feed?.author || "Unknown Author";
	authors.push(author);

	let sourceItemCount = source?.count || feed.items.length;
	totalItemCount += sourceItemCount;
	
	console.log(`[Reading] ${sourceItemCount} item(s) from ${title} by ${author}`)

	let sourceItems = feed.items.sort((a, b) => order(a.pubDate, b.pubDate));
	sourceItems = sourceItems.slice(-sourceItemCount);

	for (const item of sourceItems) { 
		if (source.extract) {
			read(item.link, function(err, article) {
				items.push({title: article.title, data: article.content, author: author, pubDate: Date.parse(item.pubDate)});
			})
		} else {
			items.push({title: item.title, data: relToAbs(feed.link, item.content), author: author, pubDate: Date.parse(item.pubDate)})
		}
	}
}

while (items.length < totalItemCount) {
	await new Promise(res => setTimeout(res, 1000));
	console.log(`Processed ${items.length} items out of ${totalItemCount}`)
}

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

new Epub({
	title: titles.toString(),
	author: authors,
	output: "output.epub",
	content: items
}).promise.then(
	() => console.log("Success"),
	err => console.log(`Error: {err}`)
)
