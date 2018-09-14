<?php
namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ComputeDiffCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:compute:diff')
            ->setDescription('Recalculate diff')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the recompute on non empty diff'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $repo = $this->getContainer()->get('capco.opinion_version.repository');

        $versions = $repo->getAllIds();

        $progress = new ProgressBar($output, \count($versions));

        foreach ($versions as $versionId) {
            $version = $repo->find($versionId);
            if ('' === $version->getDiff() || $input->getOption('force')) {
                $container->get('capco.diff.generator')->generate($version);
                $em->flush();
            }
            $progress->advance();
        }
        $progress->finish();

        $modals = $em->getRepository('CapcoAppBundle:OpinionModal')->findAll();
        $progress = new ProgressBar($output, \count($modals));
        foreach ($modals as $modal) {
            $container->get('capco.diff.generator')->generate($modal);
            $em->flush();
            $progress->advance();
        }
        $progress->finish();

        $output->writeln('Computation completed');
    }
}
