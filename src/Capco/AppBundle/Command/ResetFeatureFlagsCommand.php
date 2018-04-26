<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ResetFeatureFlagsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:reset-feature-flags')
            ->setDescription('Reset the feature flags to default values')
            ->addOption('force', false, InputOption::VALUE_NONE, 'set this option to force the reinit. Warning, this may de/activate some features')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('Please set the --force option to run this command');

            return 1;
        }

        $output->writeln('');
        $output->writeln('Resetting the feature toggles to the default configuration');

        $toggleManager = $this->getContainer()->get('capco.toggle.manager');
        $toggleManager->activate('blog');
        $toggleManager->activate('calendar');
        $toggleManager->activate('newsletter');
        $toggleManager->activate('captcha');
        $toggleManager->activate('ideas');
        $toggleManager->activate('versions');
        $toggleManager->activate('idea_creation');
        $toggleManager->activate('themes');
        $toggleManager->activate('registration');
        $toggleManager->activate('login_facebook');
        $toggleManager->activate('login_gplus');
        $toggleManager->activate('user_type');
        $toggleManager->activate('members_list');
        $toggleManager->activate('projects_form');
        $toggleManager->activate('share_buttons');
        $toggleManager->activate('project_trash');
        $toggleManager->activate('idea_trash');
        $toggleManager->activate('reporting');
        $toggleManager->activate('search');
        $toggleManager->activate('districts');
        $toggleManager->activate('phone_confirmation');
        $toggleManager->activate('server_side_rendering');
        $toggleManager->activate('profiles');
        $toggleManager->deactivate('export');
        $toggleManager->deactivate('zipcode_at_register');
        $toggleManager->deactivate('shield_mode');
        $toggleManager->deactivate('login_saml');
        $toggleManager->deactivate('login_paris');
        $toggleManager->deactivate('vote_without_account');
        $toggleManager->deactivate('restrict_registration_via_email_domain');
        $toggleManager->activate('indexation');

        $output->writeln('Feature flags reseted');
    }
}
