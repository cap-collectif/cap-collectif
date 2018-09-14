<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Resolver\UrlResolver;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class FixSynthesesUrlsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:syntheses:fix-urls')
            ->setDescription('Set original contributions urls on syntheses elements')
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Regenerate all URLs');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();

        $em = $container->get('doctrine.orm.entity_manager');
        $elements = $em
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
            $contribution = $em
                ->getRepository($el->getLinkedDataClass())
                ->find($el->getLinkedDataId());

            $url = $container->get(UrlResolver::class)->getObjectUrl($contribution, false);

            $el->setLinkedDataUrl(empty($url) ? null : $url);
        }
        $em->flush();

        $output->writeln('Urls successfully fixed');
    }
}
