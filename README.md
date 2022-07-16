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
# Lines beginning with # are comments, and will be ignored

[[sources]]
# The URL of the RSS or Atom feed
url = "https://fasterthanli.me/index.xml"

# Override the author's name
author = "Amos"

# Override the feed title
title = "Amos does stuff"

# Sometimes, the description supplied in the RSS feed will only contain a part of the content
# If extract = true is specified, then Feedpub will extract content by scraping the webpage.
extract = true

# How many entries should be saved. By default, all entries are saved.
count = 50
```
All fields except `url` are optional.

`config.toml` also has two other properties:

```
# `output` specifies the output location for the E-book.
output = "output.epub"

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

