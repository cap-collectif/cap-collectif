<?php

namespace Capco\AppBundle\Command\Api;

use Capco\AppBundle\Entity\PublicApiToken;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'capco:api:create-token',
    description: 'Creates a public api token for a user'
)]
class CreatePublicApiTokenCommand extends Command
{
    public function __construct(
        protected readonly UserRepository $userRepo,
        protected readonly EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('userEmail', InputArgument::REQUIRED, 'The user email.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $userEmail = $input->getArgument('userEmail');

        $user = $this->userRepo->findOneByEmail($userEmail);

        if (!$user) {
            $io->error(sprintf('User not found: %s', $userEmail));

            return Command::FAILURE;
        }

        $token = new PublicApiToken($user, bin2hex(random_bytes(16)));
        $this->em->persist($token);
        $this->em->flush();

        $io->info(sprintf('Successfully generated token: %s', $token->getValue()));

        return Command::SUCCESS;
    }
}
