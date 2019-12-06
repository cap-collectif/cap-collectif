<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class FixSynthesesUrlsCommand extends Command
{
    private $em;
    private $urlResolver;

    public function __construct(
        string $name = null,
        EntityManagerInterface $em,
        UrlResolver $urlResolver
    ) {
        $this->em = $em;
        $this->urlResolver = $urlResolver;

        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:syntheses:fix-urls')
            ->setDescription('Set original contributions urls on syntheses elements')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Regenerate all URLs');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $elements = $this->em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
            ->createQueryBuilder('se');

        if (!$input->getOption('force')) {
            $elements
                ->andWhere('se.linkedDataClass IS NOT NULL')
                ->andWhere('se.linkedDataId IS NOT NULL');
        }

        $elements = $elements->getQuery()->getResult();

        foreach ($elements as $el) {
            if (empty($el->getLinkedDataClass())) {
                continue;
            }
            $contribution = $this->em
                ->getRepository($el->getLinkedDataClass())
                ->find($el->getLinkedDataId());

            $url = $this->urlResolver->getObjectUrl($contribution, false);

            $el->setLinkedDataUrl(empty($url) ? null : $url);
        }
        $this->em->flush();

        $output->writeln('Urls successfully fixed');
    }
}
