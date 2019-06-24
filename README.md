# Stage Two of Restaurant Reviews - by Rommy Barriga
---
## Overview
This code covers Stage 2 of the Restaurant Reviews web application for the Mobile Web Specialist course from Udacity. It has the following features:

* A fully responsive layout
* Responsive images, both for sizing and art direction
* A restaurant listings page
* A restaurant info page
* Accessibility updates
* Service worker implementation 
* Gulp build based on Yeoman scaffold
* Utilizes IDB for the IndexedDB

## How to view
This code is scaffolded with Yeoman and requires that node.js and npm be installed. Please install these first. Additionally, this project depends on a separate project provided by Udacity to create an API end-point. This project is available on [this link](https://github.com/udacity/mws-restaurant-stage-2). Please follow the instructions there.

Once you have these dependencies installed and the API server is started, do the following:

1. In the terminal, navigate to this project folder.

2. run npm install to install project dependencies. You can opcionally also execute npm i. If bower gives you problem install it too.

3. run gulp. This will run default tasks which make a dist build but also update all files

4. With your server running, visit the site: http://localhost:8000 and explore some restaurants.

5. To test Offline behavior use Chrome devtools, go to Application / Service Workers, and then check the Offline option.
