<?php

namespace Capco\AppBundle\Behat\Traits;

use PHPUnit\Framework\Assert;

trait ExportDatasUserTrait
{
    /**
     * @Then there should be a personal data archive for user :userId
     */
    public function iCheckIfTheArchiveIsCreatedForTheUser(string $userId)
    {
        $this->getEntityManager()->clear();
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);
        if (!$archive) {
            throw new \RuntimeException('UserArchive does not exist.');
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';
        Assert::assertFileExists("$directory/$archiveFile");
    }

    /**
     * @Then the archive for user :userId should be deleted
     */
    public function iCheckIfTheArchiveIsDeletedForTheUser(string $userId)
    {
        $em = $this->getEntityManager();
        $em->clear();

        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);

        if ($em->getFilters()->isEnabled('softdeleted')) {
            $em->getFilters()->disable('softdeleted');
        }
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);

        if (!$archive) {
            throw new \Exception('UserArchive does not exist.');
        }

        $archiveFile = $archive->getPath();
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';

        Assert::assertFileNotExists("$directory/$archiveFile");
    }
}
