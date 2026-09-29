\# Video Games REST API Server



A custom RESTful API backend built with Python, Flask, and SQLite.



\## Stack

\- \*\*Language:\*\* Python 3

\- \*\*Framework:\*\* Flask

\- \*\*Database:\*\* SQLite3



\## API Endpoints



\### 1. Get All Games

\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* /games

\- \*\*Status Code:\*\* 200 OK

\- \*\*Sample Request:\*\*

&nbsp; curl -i http://127.0.0.1:5000/games



\### 2. Get Single Game

\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* /games/:id

\- \*\*Status Code:\*\* 200 OK (or 404 Not Found)

\- \*\*Sample Request:\*\*

&nbsp; curl -i http://127.0.0.1:5000/games/1



\### 3. Create Game

\- \*\*Method:\*\* POST

\- \*\*Endpoint:\*\* /games

\- \*\*Headers:\*\* Content-Type: application/json

\- \*\*Status Code:\*\* 201 Created (or 400 Bad Request)

\- \*\*Sample Request:\*\*

&nbsp; curl -i -X POST http://127.0.0.1:5000/games -H "Content-Type: application/json" -d "{\\"title\\":\\"Hollow Knight Silksong\\",\\"genre\\":\\"Metroidvania\\",\\"release\_year\\":2024,\\"platform\\":\\"PC\\",\\"rating\\":9.8}"



\### 4. Update Game

\- \*\*Method:\*\* PUT

\- \*\*Endpoint:\*\* /games/:id

\- \*\*Headers:\*\* Content-Type: application/json

\- \*\*Status Code:\*\* 200 OK, 400 Bad Request, or 404 Not Found

\- \*\*Sample Request:\*\*

&nbsp; curl -i -X PUT http://127.0.0.1:5000/games/1 -H "Content-Type: application/json" -d "{\\"title\\":\\"Zelda BOTW Updated\\",\\"genre\\":\\"Action-Adventure\\",\\"release\_year\\":2017,\\"platform\\":\\"Nintendo Switch\\",\\"rating\\":9.9}"



\### 5. Delete Game

\- \*\*Method:\*\* DELETE

\- \*\*Endpoint:\*\* /games/:id

\- \*\*Status Code:\*\* 200 OK (or 404 Not Found)

\- \*\*Sample Request:\*\*

&nbsp; curl -i -X DELETE http://127.0.0.1:5000/games/15

