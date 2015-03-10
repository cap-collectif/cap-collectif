server 'mulhouse.cap-collectif.com', user: 'jolicode', roles: [:web]
set :deploy_to,   "/home/jolicode/htdocs/demo.v2.cap-collectif.com/mulhouse"
set :parameters_yml_file, "app/config/parameters/parameters_mulhouse.yml"
