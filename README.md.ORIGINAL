## The challenge
---

* DOWNLOAD this repository to your own Github public repository.
* Create a new repo, name it by using this shortGUID generator
* Do NOT fork, as other candidates would be able to see your solution easily.
* Use [beanstalkd](http://kr.github.io/beanstalkd/), mongodb, nodejs
* Get the xe.com exchange rate, store it in mongodb for every 1 min.


## How it work?
---
1. Seed your job in beanstalkd, tube_name = your_github_username

##### Sample beanstalk payload for getting HKD to USD currency.
```
{
  "from": "HKD",
  "to": "USD"
}
```

2. Code a nodejs worker, get the job from beanstalkd, get the data from xe.com and save it to mongodb. Exchange rate need to be round off to `2` decmicals in `STRING` type.
	
	a. If request fail, reput to the tube and delay with 3s.

	b. If request is done, reput to the tube and delay with 60s.

##### mongodb data:
```
{
	"from": "HKD",
	"to": "USD",
	"created_at": new Date(1347772624825),
	"rate": "0.13"
}

```

3. Stop the task if you tried 10 succeed attempt or 3 failed attempt.

4. NOTICE that the above bs payload is just an example, you should make sure your script can be run as `distributed` system (multiple instances, multi process), and also able to get MULTIPLE currenies if needed. Not only HKD to USD.


## Tools you need
---
1. beanstalkd server is setup for you already, make a JSON request to this:

	/POST http://challenge.aftership.net:9578/v1/beanstalkd
	
	header: aftership-api-key: a6403a2b-af21-47c5-aab5-a2420d20bbec

2. Get a free mongodb server at [mongolab](https://mongolab.com/welcome/)

3. You should need [fivebeans](https://github.com/ceejbot/fivebeans) npm

4. You may also need [Beanstalk console](https://github.com/ptrofimov/beanstalk_console)

5. Our [cook book](https://github.com/AfterShip/coding-guideline-javascript)


## Help?
---
am9ic0BhZnRlcnNoaXAuY29t
