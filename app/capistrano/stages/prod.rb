server 'demo.v2.cap-collectif.com', user: 'jolicode', roles: [:web, :app]
set :deploy_to,   "/home/jolicode/htdocs/demo.v2.cap-collectif.com/prod"
set :parameters_yml_file, "app/config/parameters/parameters_prod.yml"
