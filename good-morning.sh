# Make sure you have :
# - `ttab` installed (`npm install -g ttab`) + https://github.com/mklement0/ttab/issues/23#issuecomment-645210109 for titles in iTerm2
# - `chrome-cli` installed (`brew install chrome-cli`)

# Reset all
for pid in `lsof -i4TCP:80 -P | grep Python | awk '{print $2}'`; do kill -9 $pid ; done
for pid in `lsof -i4TCP:3000 -P | grep node | awk '{print $2}'`; do kill -9 $pid ; done
for pid in `lsof -i4TCP:3001 -P | grep node | awk '{print $2}'`; do kill -9 $pid ; done
for pid in `ps -A | grep webpack | awk '{print $1}'`; do kill -9 $pid ; done

# Make sure `pipenv shell` is running
if [[ -z "${PIPENV_ACTIVE}" ]]; then
    pipenv install
    echo "Please run `pipenv shell` before good morning !"
    exit 1;
else
    echo "pipenv shell detected !"
fi

# Check install
fab local.system.doctor

# Generate SSL certificates if needed
fab local.system.generate-ssl

# Starts infrastructure
fab local.infrastructures.up

# Check deps
composer install
corepack enable
corepack yarn install --immutable

# Wait boot
corepack yarn relay
fab local.app.rabbitmq-queues

echo "Start the `capco.dev` proxy for MacOS"
ttab -t '[capco.dev] PAC Proxy' 'cd infrastructure; python -m http.server 80'

echo "Start `capco.dev` frontend watcher"
ttab -t '[capco.dev] watch' 'corepack yarn build:watch'

echo "Opening useful tabs in Chrome"
chrome-cli open "chrome://net-internals/#proxy"
sleep 5
chrome-cli open "https://capco.dev/projects"
