<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CleanLostMediasCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:clean:lost-medias')
            ->setDescription('Remove all user media that are not available anymore')
            ->addOption('force', false, InputOption::VALUE_NONE, 'set this option to force the operation')
            ->addOption('dry-run', false, InputOption::VALUE_NONE, 'set this option to show medias that will be deleted')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force')) {
            $output->writeln('This command will remove some data in your project, if you\'re sure that you want those modifications, go ahead and add --force');
            $output->writeln('Please set the --force option to run this command');

            return;
        }

        $mediasToRemove = [];
        $em = $this->getContainer()->get('doctrine.orm.entity_manager');
        $medias = $em->getRepository('CapcoMediaBundle:Media')->findAll();

        $output->writeln(count($medias) . ' medias found.');

        foreach ($medias as $media) {
            try {
                $provider = $this->getContainer()->get('sonata.media.pool')
                    ->getProvider($media->getProviderName());

                $file = $provider->getReferenceFile($media);

                // load the file content from the abstracted file system
                $tmpFile = sprintf('%s.%s', tempnam(sys_get_temp_dir(), 'sonata_media_liip_imagine'), $media->getExtension());
                file_put_contents($tmpFile, $file->getContent());
            } catch (\Exception $e) {
                $output->writeln('Media ' . $media . ' was not found and will be removed.');
                $mediasToRemove[] = $media;
            }
        }

        if (!$input->getOption('dry-run')) {
            foreach ($mediasToRemove as $media) {
                $em->remove($media);
            }
            $em->flush();
            $output->writeln(count($mediasToRemove) . ' medias have been removed.');
        }
    }
}
