<?php

namespace Capco\AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

class CreateAccountsFromEmailsCommand extends Command
{
    private $container;

    public function __construct(string $name = null, ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:import:user-acounts-from-emails')
            ->setDescription('Create users from a list of emails')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the creation'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln(
                'This command will add some data in your project, if you\'re sure that you want those data, go ahead and add --force'
            );
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $finder = new Finder();
        $finder
            ->files()
            ->in('.')
            ->name('mails.txt');

        $contents = '';
        foreach ($finder as $file) {
            $output->writeln('File found !');
            $contents = $file->getContents();
        }

        $userManager = $this->getContainer()->get('fos_user.user_manager');
        $passwordEncoder = $this->getContainer()->get('security.password_encoder');

        $emails = explode(' ', $contents);
        $dump = '';
        foreach ($emails as $key => $email) {
            $email = filter_var($email, FILTER_SANITIZE_EMAIL);
            $output->writeln('Creating account for ' . $email);

            $username = 'DRIVE' . ($key + 1);
            $password = bin2hex(openssl_random_pseudo_bytes(4));

            $user = $userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setPassword($passwordEncoder->encodePassword($user, $password));
            $user->setEnabled(true);
            $userManager->updateUser($user);
            $dump .= $email . ' ' . $username . ' ' . $password . "\r\n";
        }

        (new Filesystem())->dumpFile('dump.txt', $dump);

        $output->writeln(\count($emails) . ' accounts have been created !');
    }

    private function getContainer()
    {
        return $this->container;
    }
}
