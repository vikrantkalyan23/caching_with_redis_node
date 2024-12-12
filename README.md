# caching_with_redis_node
Caching Application with Nodejs, Redis and Mongo DB

# steps

npm init -y

npm install express axios redis mongoose


# API Endpoint

http://localhost:3500/country/<name>

If Redis isn't running, you might need to install it. For macOS, use:

brew install redis

brew services start redis

redis-server

# Debug the Redis Caching

redis-cli keys '*'


