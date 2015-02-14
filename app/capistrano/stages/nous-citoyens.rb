server 'nous-citoyens.cap-collectif.com', user: 'jolicode', roles: [:web]
set :deploy_to,   "/home/jolicode/htdocs/demo.v2.cap-collectif.com/nous-citoyens"
set :parameters_yml_file, "app/config/parameters/parameters_nous-citoyens.yml"