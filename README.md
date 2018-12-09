# DiscoverRestaurants

## Problem statement: 
Users want to find Diner's club merchants, but have no metadata to inform their decision, 
unless they go and get it themselves.

## Our solutions:
	Bring the best available metadata on Diner's club merchants to the user in the web app.

## How did we do this:
	Using a ML model, we create a curated list of merchants for each user and sort that list
	according to each individual user's predicted preferences.
	We use the following APIs:
	- Discover City Guides
	- Yelp

## What challenges did we face:
	- Handling pagination in TamperMonkey script
	- Yelp API timeout preventing model application to ALL merchants
	- Cold start for new users: without existing spend history, the model will have to compensate
	  by using proxy factors such as age, home address,  income, credit score, etc.

## How does the ML model work:
	- Our model uses Yelp rating, # of reviews, whether a DCI privilege exists, and categorical 
	 spend history to produce a score that indicates whether the user would prefer any given merchant.
	 - Higher score means higher predicted user preference
	- The model then sorts the merchants by score (descending) to deliver a curated list of merchants.

## Why is this important:
	- By providing a curated list of merchants, DCI will improve User-experience and drive usage of the app.

