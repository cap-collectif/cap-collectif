<?php

namespace Capco\AppBundle\Command\Api;

use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\PublicApiToken;
use Symfony\Component\Console\Command\Command;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreatePublicApiTokenCommand extends Command
{
    protected $userRepo;
    protected $em;

    public function __construct(UserRepository $userRepo, EntityManagerInterface $em)
    {
        $this->userRepo = $userRepo;
        $this->em = $em;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:api:create-token')
            ->setDescription('Create a public api token for a user.')
            ->addArgument('userEmail', InputArgument::REQUIRED, 'The user email.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $userEmail = $input->getArgument('userEmail');

        $user = $this->userRepo->findOneByEmail($userEmail);

        $token = new PublicApiToken($user, bin2hex(random_bytes(16)));
        $this->em->persist($token);
        $this->em->flush();

        $output->writeln('<info>Successfully generated token: ' . $token->getValue() . '</info>');

        return 0;
    }
}
