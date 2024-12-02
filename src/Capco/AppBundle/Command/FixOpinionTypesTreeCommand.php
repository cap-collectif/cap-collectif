<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\OpinionTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixOpinionTypesTreeCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OpinionTypeRepository $repository
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:fix:opinion-types')->setDescription('Fix opinion types hierarchy');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->repository->verify();
        $this->repository->recover();

        $ots = $this->repository->findAll();
        foreach ($ots as $ot) {
            $this->repository->reorder($ot, 'position');
        }

        $this->em->flush();
        $this->em->clear();

        return 0;
    }
}
