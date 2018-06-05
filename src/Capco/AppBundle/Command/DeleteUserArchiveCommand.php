<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\UserArchive;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;

class DeleteUserArchiveCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:userArchives:delete')
            ->setDescription('Delete the archive datas requested by a user');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()->get('doctrine.orm.entity_manager');

        $currDate = new \DateTime();
        $dateToDelete = $currDate->modify('-7 day');

        $output->writeln('Retrieving archives ...');
        $archives = $this->getContainer()->get('capco.user_archive.repository')->getArchivesToDelete($dateToDelete);

        $output->writeln(\count($archives) . ' archives to delete.');
        $progress = new ProgressBar($output, \count($archives));

        foreach ($archives as $archive) {
            $archive->setDeletedAt(new \DateTime());
            $archive->setReady(false);

            $this->removeArchiveFile($archive);
            $progress->advance();
        }

        $em->flush();

        $output->writeln('Old users archives are deleted !');
    }

    protected function removeArchiveFile(UserArchive $archive)
    {
        $job = new Process('rm web/export/' . $archive->getPath());
        $job->mustRun();
    }
}
