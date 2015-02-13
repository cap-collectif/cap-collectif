set :deploy_config_path, "app/capistrano/deploy.rb"
set :stage_config_path, "app/capistrano/stages/"

# Load DSL and Setup Up Stages
require 'capistrano/setup'

# Includes default deployment tasks
require 'capistrano/deploy'
require 'capistrano/symfony'
require 'capistrano/composer'
require 'capistrano/file-permissions'
require 'capistrano/npm'
require 'capistrano/bower'
require 'capistrano/gulp'
require 'capistrano/slackify'

# Loads custom tasks from `lib/capistrano/tasks' if you have any defined.
Dir.glob('app/capistrano/tasks/*.cap').each { |r| import r }
