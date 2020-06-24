<?php

namespace Capco\AppBundle\Command;

use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class CreateAccountsFromEmailsCommand extends Command
{
    private UserManagerInterface $userManager;
    private UserPasswordEncoderInterface $passwordEncoder;

    public function __construct(
        ?string $name,
        UserManagerInterface $userManager,
        UserPasswordEncoderInterface $passwordEncoder
    ) {
        parent::__construct($name);
        $this->userManager = $userManager;
        $this->passwordEncoder = $passwordEncoder;
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

            return 1;
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

        $emails = explode(' ', $contents);
        $dump = '';
        foreach ($emails as $key => $email) {
            $email = filter_var($email, FILTER_SANITIZE_EMAIL);
            $output->writeln('Creating account for ' . $email);

            $username = 'DRIVE' . ($key + 1);
            $password = bin2hex(openssl_random_pseudo_bytes(4));

            $user = $this->userManager->createUser();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setPassword($this->passwordEncoder->encodePassword($user, $password));
            $user->setEnabled(true);
            $this->userManager->updateUser($user);
            $dump .= $email . ' ' . $username . ' ' . $password . "\r\n";
        }

        (new Filesystem())->dumpFile('dump.txt', $dump);

        $output->writeln(\count($emails) . ' accounts have been created !');

        return 0;
    }
}
