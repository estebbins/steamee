# steamee
## Full-stack Application Project
==link to live site==

## Overview
This is a full-stack Node application designed to help users discover and recommend local co-op games available on Steam or other platforms. All too frequently, couples, friends, or just any two strangers in a room, scour the internet for good local co-op games, just to find the same three websites, recommending the same handful of games they've already played! It's time to get steamee!

### Technologies Used:
- Mongoose
- MongoDb
- Express
- Morgan
- Postman
- bcryptjs
- Liquid express views
- Axios
- Internal Steam Web API [^5]
    - particularly - GET search/results [^6]
- Do JavaScript, Node, Nodemon, dotenv, method-override, express-session, connect-mongo need to be included?

## User stories
**As a user, I want the ability to** 
- sign up
- sign in
- sign out
- view a list of local co-op games directly from Steam's API
- view the list of local co-op games fellow steamees have saved or added
- sort & the list by the steamee rating
- see how many users have saved the game to their account
- save games to my user account
- indicate if I've played this game as local co-op
- leave a rating out of 5 for the game
- leave a comment on a game
- delete a comment I made
- view comments from other users
- create a new game entry
- Update a game entry I made
- view only my game entries & saved games
- delete only my game entry

## Wireframes/Screenshots
![five_wireframes](assets/wireframes_ct_5.jpg)
![two_wireframes](assets/wireframes_ct_2.jpg)

## Entity Relationship Diagrams
![erd](assets/ERD_v1.jpg) [^7]

#### Games
| **URL**              | **HTTP Verb** |**Actions**|
|----------------------|---------------|-----------|
| /games/             | GET           | index
| /games/:id          | GET           | show
| /games/new          | GET           | new
| /games              | POST          | create
| /games/:id/edit     | GET           | edit
| /games/:id          | PATCH/PUT     | update
| /games/:id          | DELETE        | destroy   |

#### Steam games route
| **URL**              | **HTTP Verb** |**Actions**|
|----------------------|---------------|-----------|
| /store/             | GET           | index      |

#### ratings

| **URL**              | **HTTP Verb** |**Actions**|
|----------------------------------------|---------------|-----------|
| /ratings/:gameId                     | POST          | create
| /ratings/delete/:gameID/:ratingId   | DELETE        | destroy   |

#### comments

| **URL**              | **HTTP Verb** |**Actions**|
|----------------------------------------|---------------|-----------|
| /comments/:gameId                     | POST          | create
| /comments/delete/:gameID/:commentId   | DELETE        | destroy   |

#### Authentication: Users

| **URL**              | **HTTP Verb** |**Actions**|**Controller#Action**|
|----------------------|---------------|-----------|---------------------|
| /auth/signup         | POST          | new       | users#signup
| /auth/login          | POST          | create    | users#login
| /auth/logout         | DELETE        | destroy   | users#logout        |

## Approach taken
**Rough Draft Description of Approach:** 
- On the Steam store screen, an API call will get a filtered list of Steam games to display as cards in the views. 
- Users can "save" the game to their personal profile if they haven't already been saved, or can view the steamee game card, which will contain user ratings entered on steamee, how many users have saved it. If the user wants to dig deeper, they will with view (show route) the game and be able to see user comments. 
- When users save the game, a document will be created from the Game model.
(diagrams that describe the relationships between your resources)
- Eventually, the steamee view-all page will contain other games added by users, in addition to the ones that were saved directly from the steam store API call.
- Example API Call: https://store.steampowered.com/search/results/?filter=category3=39&tags=3841&ignore_preferences=1&sort_by=Reviews_DESC&supportedlang=english&json=1
    - shared/split screen (category3=39)
    - local co-op tag (tags=3841)
    - sorted by reviews (sort_by=Reviews_DESC)
    - english games (supportedlang=english)
    - json format (json=1)
    - preferences ignored (ignore_preferences=1)
RESULTS:
```
"desc": "",
    "items": [
        {
            "name": "Rhythm of the Night",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/bundles/23200/6lbanfr9qo1lpmt7/capsule_sm_120.jpg?t=1634705480"
        },
        {
            "name": "Rhythm Doctor",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/774181/capsule_sm_120.jpg?t=1667332753"
        },
        {
            "name": "Left 4 Dead Bundle",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/bundles/233/38smshw5fjvh9vp4/capsule_sm_120.jpg?t=1456861419"
        },
        {
            "name": "Left 4 Dead 2",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/550/capsule_sm_120.jpg?t=1666824129"
        },
        {
            "name": "The Binding of Isaac: Rebirth",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/250900/capsule_sm_120.jpg?t=1617174663"
        },
        {
            "name": "BattleBlock Theater®",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/238460/capsule_sm_120.jpg?t=1671827860"
        },
        {
            "name": "Broforce",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/274190/capsule_sm_120.jpg?t=1666986997"
        },
        {
            "name": "Everhood + Rhythm Doctor",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/bundles/26852/zqb8h9sjtgo6v5xg/capsule_sm_120.jpg?t=1656112311"
        },
        {
            "name": "Duck Game",
            "logo": "https://cdn.cloudflare.steamstatic.com/steam/apps/312530/capsule_sm_120.jpg?t=1606522299"
        },...
```
- STRETCH GOAL: Users can enter their own games, and if they include a steam id (found in the url of the game's store page after app/NNNNNNN, an API call using the GET /broadcast/ajaxgetbatchappcapsuleinfo will link in other information about the game. Example store page url: https://store.steampowered.com/app/312530/Duck_Game/
- Example API Call: https://store.steampowered.com/broadcast/ajaxgetbatchappcapsuleinfo?appids=312530&cc=NL&l=english&origin=https:%2F%2Fstore.steampowered.com
RESULTS:
```
{
    "apps": [
        {
            "appid": 312530,
            "type": "game",
            "title": "Duck Game",
            "capsule": "312530/header.jpg?t=1606522299",
            "main_capsule": "312530/capsule_616x353.jpg?t=1606522299",
            "tiny_capsule": "312530/capsule_sm_120.jpg?t=1606522299",
            "subid": 47116,
            "orig_price_in_cents": 1299,
            "orig_price": "",
            "price_in_cents": 1299,
            "price": "12,99€",
            "is_free": false,
            "free_weekend_label": "",
            "library_asset": "312530/library_600x900.jpg?t=1606522299",
            "discount_percent": 0,
            "rt_release_date": 1433437184,
            "release": "4 Jun, 2015",
            "reviews_filtered": {
                "num_reviews": 22305,
                "num_positive": 21661,
                "score": 9,
                "label": "Overwhelmingly Positive"
            },
            "reviews_unfiltered": {
                "num_reviews": 22305,
                "num_positive": 21661,
                "score": 9,
                "label": "Overwhelmingly Positive"
            },
            "content_descriptors": [],
            "available_windows": true,
            "available_mac": false,
            "available_linux": false,
            "screenshot_list": [
                "312530/ss_e0d4c29f0c6b93903916d35ec79ea5f2560932d5.jpg?t=1606522299",
                "312530/ss_6da6723e0908f866142d69cebb5c13ec60063cab.jpg?t=1606522299",
                "312530/ss_b20f323e1d27e4573a2afae3f4db9021da89dd3c.jpg?t=1606522299",
                "312530/ss_250bcab1b9bbb209bf90ef4fe3a3178e4a33e184.jpg?t=1606522299"
            ],
            "microtrailer": "https://cdn.akamai.steamstatic.com/steam/apps/2039860/microtrailer.webm?t=1447375811",
            "microtrailer_mp4": "https://cdn.akamai.steamstatic.com/steam/apps/2039860/microtrailer.mp4?t=1447375811",
            "button_action": "Add to Cart",
            "tags": [
                {
                    "name": "Multiplayer",
                    "tagid": 3859
                },
                {
                    "name": "Funny",
                    "tagid": 4136
                },
                {
                    "name": "Pixel Graphics",
                    "tagid": 3964
                },
                {
                    "name": "Local Multiplayer",
                    "tagid": 7368
                },
                {
                    "name": "Action",
                    "tagid": 19
                },
                {
                    "name": "2D",
                    "tagid": 3871
                },
                {
                    "name": "4 Player Local",
                    "tagid": 4840
                },
                {
                    "name": "Platformer",
                    "tagid": 1625
                },
                {
                    "name": "Indie",
                    "tagid": 492
                },
                {
                    "name": "Fast-Paced",
                    "tagid": 1734
                }
            ],
            "app_to_run": 312530,
            "coming_soon": false,
            "early_access": false,
            "no_main_cap": false,
            "required_age": 0,
            "support_vrhmd": false,
            "support_vrhmd_only": false,
            "creator_clan_ids": [
                5635894
            ],
            "localized_langs": [
                0
            ],
            "deck_compatibility_category": 3
        }
    ],
    "success": 1
}
```

## Installation instructions
## Unsolved problems

## Project Requirements
Project 2 overview. [^2]
Project planning guide. [^1]
### MVP
**MVP for approval:**
- [ ] Model 1:
    - Game:
        - gameSchema:
            - gameName: String
            - gameLogo: String (will be looking for url)
            - ratings: [ratingSchema]
            - comments: [commentSchema]
            - owner: Schema.Types.ObjectId, ref: 'User'
    - User:
        - userSchema:
            - in addition to below properties, userSchema will contain subdocuments savedGamesSchema
    ```
    const userSchema = new Schema ({
        username: {
            type: String,
            required: true,
            unique: true
        }, 
        password: {
            type: String, 
            required: true
        }
    })
    ```
- [ ] Model or Subdocument 2: 
    - example: ratingSchema
    - additional: commentSchema, savedGamesSchema
        - savedGamesSchema to have {gameId: {type: Schema.Types.ObjectId, ref: 'Game'}}, {hasPlayed: {type: Boolean}}
    ```
    const ratingSchema = new Schema ({
        rating: {
            type: Number, 
            required: true,
            min: 0,
            max: 5
        }, 
        author: {
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true
        }
    }, {
        timestamps: true
    })
    ```
- [ ] API or Seed: Internal Steam Web API, minimum 1 user-created game
- [ ] Resource RESTful routes:

**Stretch Goals:**
- [ ] 
 
**Technical Requirements:**
- [ ] Have at least 2 models, not including user (subdocument permitted)
- [ ] Incorporate API [^4] or seed Database (>=10 documents)
- [ ] Have complete RESTful routes for at least one resource (GET, POST, PUT & DELETE)
- [ ] Utilize ODM (Mongoose) to create database table structure & interact with Mongo-Db-stored data
- [ ] Include a README file that explains how to use app
- [ ] Route table for RESTful routes included in README
- [ ] Semantically clean HTML, CSS, and back-end code
- [ ] Be deployed online & accessibl to public
**Necessary Deliverables:**
- [ ] Project approval (est date of completion 1/23/23)
- [ ] A working full-stack application, built by me, hosted on internet
- [ ] A link to hosted working app in URL section of Github repo
- [ ] A git repo hosted on Github with link to hosted project, frequent commits, dating back to the very beginning of the project
- [ ] A README.md with explanations of technologies used, approach taken, installation insutrctions, unsolved problems, and a link to the live site

### Project Planning
**Sprint 1 (Est completion 1/23/23):**
- [x] Develop project pitch (1/20/23-1/23/23)
- [x] Create README.md file with project plannings steps
- [x] Gain project approval (1/23/23)

**Sprint 2 (Est completion 1/23/23):**
- [x] Review mongoose-express-liquid-boilerplate documentation [^3]
- [x] Follow boilerplate installation instructions [^3]
- [x] Install other dependencies as needed
- [ ] Ensure API functioning properly from template
- [ ] Begin model 1 build 
- [ ] Seed database and/or incoporate API
- [ ] Create Index & Show Routes & test in Postman
- [ ] Question - would it be better to store data from an API call for next time, or do the API calls?
- [ ] Question - fully define the model or modify later?

**Sprint 3 (Est completion 1/25/23):**
- [ ] Adjust seed route to script if necessary
- [ ] Create user model
- [ ] Complete model 1 5 RESTful routes & test in Postman ( - new & edit to be completed)
- [ ] Create model 2/subdocument
- [ ] Create user & model 2 routes, and test in Postman
- [ ] Confirm back-end development working without unnecessary bugs
- [ ] Set up for liquid-views

**Sprint 4 (Est completion 1/27/23):**
- [ ] Complete liquid views
- [ ] Enhance styling of pages, get feedback
- [ ] Update responses & error handling for liquid views
- [ ] Conduct extensive views testing & ensure DB connection intact
- [ ] Evaluate readiness for deployment
- [ ] Merge development branch(s) as needed with main

**Sprint 5 (Est completion 1/29/23):**
- [ ] Deploy application
- [ ] Conduct extensive testing
- [ ] Conduct user acceptance testing
- [ ] Address bugs, errors, feedback
- [ ] Update README.md with all necessary requirements & information
- [ ] Confirm all technical requirements & MVP completion
- [ ] Submit project 2 per submission instructions

**Final Deliverable (Est completion 1/30/23):**
- [ ] Present deliverable to SEI Cohort & Instructors
- [ ] Update documentation to incorporate feedback and development opportunities

[^1]: https://git.generalassemb.ly/sei-ec-remote/planning-projects
[^2]: https://git.generalassemb.ly/sei-ec-remote/project_2
[^3]: https://git.generalassemb.ly/sei-ec-remote/mongoose-express-liquid-boilerplate
[^4]: https://github.com/public-apis/public-apis#business
[^5]: https://github.com/Revadike/InternalSteamWebAPI/wiki
[^6]: https://github.com/Revadike/InternalSteamWebAPI/wiki/Get-Search-Results
[^7]: used figma to create ERD
