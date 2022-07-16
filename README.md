# Feedpub

A NodeJS application that aggregates items from your RSS and Atom feeds into an E-book.

## Installation

Prerequisites: NodeJS, npm, git

1. Clone the GitHub repository:
	```
	git clone https://github.com/shivrm/feedpub
	```

2. Navigate to the folder
	```
	cd feedpub
	```

3. Install dependencies
	```
	npm install
	```

## Basic Usage

All configurations are stored in `config.toml`. Each source entry looks like this:

```toml
[[sources]]
url = "https://fasterthanli.me/index.xml" # The URL of the feed
author = "Amos" # Override the author's name
title = "Amos does stuff" # Override the feed's title
# Sometimes, the description supplied in the RSS feed will only contain a part of the content
# If extract = true is specified, then Feedpub will extract content by scraping the webpage.
extract = true
count = 50 # The number of items that should be saved. All items will be saved if not specified.
```
All fields except `url` are optional.


There are also two other properties:
```
output = "output.epub" # Specifies the output location for the E-book

# `order` specifies how to orser the items. It can have one of 4 values: `none`, `length`,
# `date` and `title`. If it is not specified, then `none` will be used as the default.
#
# `none`: Use the default order - Items in a source as ordered from oldest to newest,
#		and the sources are ordered based on the order they appear in `config.toml`
# `length`: Items are ordered based on the length of their content - from shortest to longest.
# `date`: Items are ordered from oldest to newest.
# `title`: Items are ordered based on the alphabetic order of their titles.
order = "date"
```

Run the application using NodeJS:
```
node .
```

Fetching the feeds and processing the content may take some time. After processing, the E-book
will be available in the path specified by the `output` property.

# License

Feedpub is licensed under the MIT License. See [LICENSE.md](LICENSE.md).

