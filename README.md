# 📓 lawliet

Death notes for broken links in your documentation files

![lawliet](https://github.com/mguellsegarra/lawliet/blob/master/screenshot.png?raw=true)

## Why this tool

**lawliet** is a tool for searching broken links in your documentation files.

When working in large projects where your only option for organizing your own SDK documentation is to keep a bunch of .md files inside a Git repo, mantaining all the links inside every document becomes a real nightmare.

## What does

This tool will:

* Search recursively for plain text files with the extenion you choose (.md, .html, .txt, etc.)
* On those files it will look up for URL's
* For every file that has URL's inside, it will check every entry making a GET request
* Will save the results that ended with an error response code different than 200, or when the URL have preconfigured text inside its content
* It will export the results in a CSV file

## Installation

_You'll need Node v6.9.4 installed on your OS of choice_

* Just clone this repo:

```
# git clone https://github.com/mguellsegarra/lawliet.git
# cd lawliet
```

Then, install the dependencies:

```
# npm install
```

## Configuration

You can customize **lawliet** in order to fit your needs. For that purpose, there's a *config.json* file:

```json
{
  "outputFilename": "death_notes.csv",
  "extensionFiles": ".md",
  "not_found_text": "The page you're looking for could not be found (404)",
  "not_authenticated_text": "Login Mordorbank",
  "hosts": [
    {
      "host": "mordorbank.org",
      "proxy": "http://10.0.0.1:8080",
      "cookies": [
        "some_auth_session_token"
      ]
    }
  ],
  "strictSSL": false
}
```

* **outputFilename** (required) →  The output file name. By default: `death_notes.csv`
* **extensionFiles** (required) →  The extension of the files to look for. By default, markdown files: `.md`
* **not_found_text** _(optional)_ → Sometimes there are webpages that returns a 200 code, but in fact is not so (e.g. some Gitlab not found pages, etc.).
* **not_authenticated_text** _(optional)_ → When you want to filter also when the URL shows a login form
* **hosts** _(optional)_ → The tool will check if every URL belongs to some of the hosts found in this config property, and will apply its configuration.
  * __host__ → The hostname to search for in the URL
  * __proxy__ → HTTP Proxy to fetch all the URL's that matchs this host
  * __cookies__ → List of cookie keys needed to fetch that host. The tool will ask for values for every entry configured here.
* **strictSSL** _(optional)_ → If you want to validate if SSL certificate is valid

## Usage

You can run **lawliet** like this:

```# node index.js```

And a CLI interface will ask you for the path, and more parameters.

## TODO

* Detect and follow relative markdown links (e.g: `[link](../doc/sdk.md)`)
* Improve URL extraction and parsing
* Implement unit testing

## Contributing 

Feel free to open any pull request if you'd like to add new features or improve **lawliet** :)

## License 

The MIT License (MIT)

Copyright (c) 2018 Marc Güell Segarra
