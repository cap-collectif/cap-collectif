lock '3.3.3'

set :application, "CapCo"
set :repo_url,  "git@github.com:jolicode/CapCollectif-SF2.git"
set :branch, 'develop'

set :format, :pretty
set :log_level, :info
set :keep_releases, 2

# Symfony environment
set :symfony_env,  "prod"

# Symfony application path
set :app_path,              "app"

# Symfony web path
set :web_path,              "web"

# Symfony log path
set :log_path,              fetch(:app_path) + "/logs"

# Symfony cache path
set :cache_path,            fetch(:app_path) + "/cache"

# Symfony config file path
set :app_config_path,       fetch(:app_path) + "/config"

# Controllers to clear
set :controllers_to_clear, ["app_*.php"]

# Files that need to remain the same between deploys
set :linked_files,          [ fetch(:app_config_path) + "/parameters.yml" ]

# Dirs that need to remain the same between deploys (shared dirs)
set :linked_dirs,           [fetch(:log_path), fetch(:web_path) + "/uploads", fetch(:web_path) + "/media", "vendor"]

# Dirs that need to be writable by the HTTP Server (i.e. cache, log dirs)
set :file_permissions_paths,         [fetch(:log_path), fetch(:cache_path), fetch(:web_path) + "/uploads", fetch(:web_path) + "/media"]

set :file_permissions_users, ["www-data"]

# Name used by the Web Server (i.e. www-data for Apache)
set :webserver_user,        "www-data"

# Method used to set permissions (:chmod, :acl, or :chown)
set :permission_method,     :acl

# Execute set permissions
set :use_set_permissions,   true

# Symfony console path
set :symfony_console_path, fetch(:app_path) + "/console"

# Symfony console flags
set :symfony_console_flags, "--no-debug"

# Assets install path
set :assets_install_path,   fetch(:web_path)

# Assets install flags
set :assets_install_flags,  '--symlink'

# Assetic dump flags
set :assetic_dump_flags,  ''

set :composer_install_flags, '--no-dev --prefer-dist --no-interaction --optimize-autoloader'

fetch(:default_env).merge!(symfony_env: fetch(:symfony_env))



set :gulp_tasks, 'build'

before 'deploy:starting', 'symfony2:parameters'
after 'bower:install', 'gulp'
before "deploy:set_permissions:check", 'symfony2:cache_create'
before "composer:install", "deploy:set_permissions:acl"
