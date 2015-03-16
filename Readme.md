#Babel

Babel is a [ProcessWire][PW] module that provides functionality for managing 
section based multilanguage sites. It is inspired by [Babel Plugin][Babel MODX] for [MODX][MODX].

[PW]: 					https://processwire.com "Open source CMS with a great API–ProcessWire CMF/CMS"
[Babel MODX]: 	http://rtfm.modx.com/extras/revo/babel
[MODX]: 				http://modx.com/

## How to Install

1. Copy all the files in this directory to /site/modules/Babel/ 

2. In your admin, go to Modules > Check for new modules. 

3. Click the "Install" button next to Babel.


## Settings

First of all you should set the root page for each language. 

Next choose the preferred way of translation of pages in the admin interface. 
You can choose either to have an additional action button titled `translate` 
for each page or have a `Translation` tab for each page when editing it. Or you 
can choose to have both methods for translating a page.

You will be able to either link already existing page as a translation or create 
a new page that will automatically be linked as a translation.

Usually multilingual sites will have a structure like...

```
Root
	|__Home (English)
	     |__About
	     |__News
	     		  |__ News Article 1
	     		  |__ News Article 2
	     		  |__ News Article 3
	     		  |__ News Article 4
	     |__Contact
	     ...
	|__Главная (Russian)
	     |__О нас
	     |__Новости
	     		  |__ Новостная статья 1
	     		  |__ Новостная статья 2
	     		  |__ Новостная статья 3
	     		  |__ Новостная статья 4
	     |__Связаться
	     ...
	|__Baş (Turkmen)
	     |__Barada
	     |__Habarlar
	     		  |__ Habar Makalasy 1
	     		  |__ Habar Makalasy 2
	     		  |__ Habar Makalasy 3
	     		  |__ Habar Makalasy 4
	     |__Aragatnaşyk
	     ...
```
All you need to do is to link already existing pages as translations to each 
other and Babel will try to figure out where should the new pages be created when 
new translations are needed.


## API
Babel creates couple useful methods and properties on `$page` object for you.

### translation Method
This method returns the page that was assigned as a translation for the given `$language`.

##### Syntax
	`$page->translation($language);`

##### Arguments
The method accepts only one argument. The `$language` argument could be either a 
`string`(the name of the language), or Language object.

##### Return
The method returns a `Page` object or `NullPage` if the translation is not available.

### translate Method
This method will create a translation link to the given page if not already exists or 
overwrite if otherwise.

##### Syntax
	`$page->translate($translation, $language);`

##### Arguments
The `$translation` argument should be either a `Page` object or `null`. If it 
is `null` Babel will create a new page. Babel will always try to mirror the 
language trees as close as possible. The location of the `$translation`
page will be determined based on the family settings of the templates and 
the translations of the parent pages of the `$page` object.
The `$language` argument could be either the name of the language (`string`) 
that you want to translate the `$page` to, or it's `Language` object.

##### Return
The method returns the `$page` object.


### Contents
[TOC]