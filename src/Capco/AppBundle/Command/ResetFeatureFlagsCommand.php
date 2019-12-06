<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ResetFeatureFlagsCommand extends Command
{
    private $container;
    private $manager;

    public function __construct(
        string $name = null,
        ContainerInterface $container,
        Manager $manager
    ) {
        $this->container = $container;
        $this->manager = $manager;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:reset-feature-flags')
            ->setDescription('Reset the feature flags to default values')
            ->addOption(
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

        $env = $this->getContainer()->getParameter('kernel.environment');
        $output->writeln('');
        $output->writeln('Resetting the feature toggles to the default ' . $env . ' configuration');

        $this->manager->activate('blog');
        $this->manager->activate('calendar');
        $this->manager->activate('newsletter');
        $this->manager->activate('captcha');
        $this->manager->activate('versions');
        $this->manager->activate('themes');
        $this->manager->activate('registration');
        $this->manager->activate('login_facebook');
        $this->manager->activate('login_gplus');
        $this->manager->activate('user_type');
        $this->manager->activate('members_list');
        $this->manager->activate('projects_form');
        $this->manager->activate('share_buttons');
        $this->manager->activate('project_trash');
        $this->manager->activate('reporting');
        $this->manager->activate('search');
        $this->manager->activate('districts');
        $this->manager->deactivate('phone_confirmation');
        $this->manager->activate('server_side_rendering');
        $this->manager->activate('profiles');
        $this->manager->deactivate('export');
        $this->manager->deactivate('zipcode_at_register');
        $this->manager->deactivate('shield_mode');
        $this->manager->deactivate('login_saml');
        $this->manager->deactivate('restrict_registration_via_email_domain');
        $this->manager->deactivate('login_paris');
        $this->manager->deactivate('allow_users_to_propose_events');
        $this->manager->activate('indexation');
        $this->manager->activate('developer_documentation');
        $this->manager->deactivate('disconnect_openid');
        $this->manager->deactivate('sso_by_pass_auth');
        $this->manager->deactivate('graphql_query_analytics');
        $this->manager->activate('consultation_plan');
        $this->manager->activate('display_map');
        $this->manager->activate('privacy_policy');
        $this->manager->activate('public_api');
        $this->manager->activate('consent_internal_communication');
        $this->manager->activate('new_feature_questionnaire_result');
        $this->manager->activate('unstable__multilangue');
        $this->manager->deactivate('login_franceconnect');
        $this->manager->deactivate('read_more');
        $this->manager->deactivate('display_pictures_in_depository_proposals_list');

        if ('test' === $env) {
            $this->manager->deactivate('shield_mode');
            $this->manager->activate('public_api');
            $this->manager->activate('indexation');
        }

        if ('prod' === $env) {
            $this->manager->deactivate('registration');
            $this->manager->deactivate('login_facebook');
            $this->manager->deactivate('login_gplus');
            $this->manager->deactivate('server_side_rendering');
            $this->manager->deactivate('developer_documentation');
            $this->manager->deactivate('login_saml');
            $this->manager->deactivate('login_paris');
            $this->manager->deactivate('disconnect_openid');
            $this->manager->deactivate('public_api');
            $this->manager->deactivate('search');

            $this->manager->activate('captcha');
            $this->manager->activate('consent_internal_communication');

            $this->manager->activate('export');

            $this->manager->activate('shield_mode');

            $this->manager->deactivate('unstable__multilangue');
        }

        $output->writeln('Feature flags reseted');
    }

    private function getContainer()
    {
        return $this->container;
    }
}
