<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ResetFeatureFlagsCommand extends Command
{
    public function __construct(
        string $name,
        private readonly Manager $manager,
        private readonly string $env
    ) {
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setDescription('Reset the feature flags to default values')->addOption(
            'force',
            false,
            InputOption::VALUE_NONE,
            'set this option to force the reinit. Warning, this may de/activate some features'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('Please set the --force option to run this command');

            return 1;
        }

        $output->writeln(
            'Resetting the feature toggles to the default <info>' .
                $this->env .
                '</info> configuration'
        );

        $this->manager->activate(Manager::blog);
        $this->manager->activate(Manager::calendar);
        $this->manager->activate(Manager::newsletter);
        $this->manager->activate(Manager::captcha);
        $this->manager->activate(Manager::turnstile_captcha);
        $this->manager->activate(Manager::versions);
        $this->manager->activate(Manager::themes);
        $this->manager->activate(Manager::registration);
        $this->manager->activate(Manager::login_facebook);
        $this->manager->activate(Manager::user_type);
        $this->manager->activate(Manager::members_list);
        $this->manager->activate(Manager::projects_form);
        $this->manager->activate(Manager::share_buttons);
        $this->manager->activate(Manager::project_trash);
        $this->manager->activate(Manager::reporting);
        $this->manager->activate(Manager::search);
        $this->manager->activate(Manager::districts);
        $this->manager->deactivate(Manager::phone_confirmation);
        $this->manager->activate(Manager::server_side_rendering);
        $this->manager->activate(Manager::profiles);
        $this->manager->activate(Manager::export);
        $this->manager->deactivate(Manager::zipcode_at_register);
        $this->manager->deactivate(Manager::shield_mode);
        $this->manager->deactivate(Manager::login_saml);
        $this->manager->deactivate(Manager::login_cas);
        $this->manager->deactivate(Manager::restrict_registration_via_email_domain);
        $this->manager->deactivate(Manager::allow_users_to_propose_events);
        $this->manager->activate(Manager::indexation);
        $this->manager->activate(Manager::developer_documentation);
        $this->manager->deactivate(Manager::oauth2_switch_user);
        $this->manager->deactivate(Manager::sso_by_pass_auth);
        $this->manager->deactivate(Manager::graphql_query_analytics);
        $this->manager->activate(Manager::consultation_plan);
        $this->manager->activate(Manager::display_map);
        $this->manager->activate(Manager::privacy_policy);
        $this->manager->activate(Manager::public_api);
        $this->manager->activate(Manager::graphql_introspection);
        $this->manager->activate(Manager::votes_min);
        $this->manager->activate(Manager::consent_internal_communication);
        $this->manager->activate(Manager::questionnaire_result);
        $this->manager->activate(Manager::multilangue);
        $this->manager->activate(Manager::http_redirects);
        $this->manager->deactivate(Manager::login_franceconnect);
        $this->manager->deactivate(Manager::read_more);
        $this->manager->deactivate(Manager::display_pictures_in_depository_proposals_list);
        $this->manager->activate(Manager::display_pictures_in_event_list);
        $this->manager->activate(Manager::sentry_log);
        $this->manager->activate(Manager::remind_user_account_confirmation);
        $this->manager->deactivate(Manager::emailing);
        $this->manager->deactivate(Manager::emailing_parameters);
        $this->manager->activate(Manager::proposal_revisions);
        $this->manager->deactivate(Manager::export_legacy_users);
        $this->manager->activate(Manager::import_proposals);
        $this->manager->activate(Manager::analytics_page);
        $this->manager->activate(Manager::project_admin);
        $this->manager->deactivate(Manager::noindex_on_profiles);
        $this->manager->activate(Manager::paper_vote);
        $this->manager->activate(Manager::emailing_group);
        $this->manager->activate(Manager::antivirus);

        if ('test' === $this->env) {
            $this->manager->activate(Manager::votes_min);
            $this->manager->deactivate(Manager::shield_mode);
            $this->manager->activate(Manager::public_api);
            $this->manager->activate(Manager::indexation);
            $this->manager->deactivate(Manager::sentry_log);
            $this->manager->deactivate(Manager::export_legacy_users);
            $this->manager->deactivate(Manager::import_proposals);
            $this->manager->deactivate(Manager::analytics_page);
            $this->manager->deactivate(Manager::paper_vote);
            $this->manager->deactivate(Manager::helpscout_beacon);
            $this->manager->activate(Manager::multilangue);
        }

        if ('prod' === $this->env) {
            $this->manager->activate(Manager::votes_min);
            $this->manager->deactivate(Manager::registration);
            $this->manager->deactivate(Manager::login_facebook);
            $this->manager->deactivate(Manager::server_side_rendering);
            $this->manager->deactivate(Manager::developer_documentation);
            $this->manager->deactivate(Manager::login_saml);
            $this->manager->deactivate(Manager::login_cas);
            $this->manager->deactivate(Manager::oauth2_switch_user);
            $this->manager->deactivate(Manager::public_api);
            $this->manager->deactivate(Manager::search);
            $this->manager->activate(Manager::http_redirects);
            $this->manager->activate(Manager::captcha);
            $this->manager->activate(Manager::consent_internal_communication);
            $this->manager->activate(Manager::export);
            $this->manager->activate(Manager::shield_mode);
            $this->manager->deactivate(Manager::multilangue);
            $this->manager->deactivate(Manager::export_legacy_users);
            $this->manager->activate(Manager::import_proposals);
            $this->manager->activate(Manager::analytics_page);
            $this->manager->deactivate(Manager::project_admin);
            $this->manager->activate(Manager::paper_vote);
            $this->manager->activate(Manager::secure_password);
            $this->manager->activate(Manager::restrict_connection);
            $this->manager->activate(Manager::display_pictures_in_depository_proposals_list);
            $this->manager->activate(Manager::display_pictures_in_event_list);
            $this->manager->activate(Manager::emailing);
            $this->manager->activate(Manager::emailing_parameters);
            $this->manager->activate(Manager::proposal_revisions);
            $this->manager->activate(Manager::new_project_card);
            $this->manager->deactivate(Manager::user_type);
            $this->manager->activate(Manager::helpscout_beacon);
            $this->manager->activate(Manager::emailing_group);
            $this->manager->deactivate(Manager::organizations);
            $this->manager->deactivate(Manager::mediator);
            $this->manager->deactivate(Manager::antivirus);
        }

        $output->writeln('<info>Feature flags reseted ! </info>');

        return 0;
    }
}
