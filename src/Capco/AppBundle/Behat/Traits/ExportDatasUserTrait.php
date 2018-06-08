<?php

namespace Capco\AppBundle\Behat\Traits;

trait ExportDatasUserTrait
{
    /**
     * @Then I check if the archive is created for the user :userId
     */
    public function iCheckIfTheArchiveIsCreatedForTheUser(string $userId)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);
        $archiveFile = $archive ? $archive->getPath() : '';
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';
        \PHPUnit_Framework_Assert::assertFileExists("$directory/$archiveFile");
    }

    /**
     * @Then I check if the archive is deleted for the user :userId
     */
    public function iCheckIfTheArchiveIsDeletedForTheUser(string $userId)
    {
        $user = $this->getRepository('CapcoUserBundle:User')->find($userId);
        $archive = $this->getRepository('CapcoAppBundle:UserArchive')->getLastForUser($user);
        $archiveFile = $archive ? $archive->getPath() : '';
        $directory = $this->getContainer()->getParameter('kernel.root_dir') . '/../web/export/';

        \PHPUnit_Framework_Assert::assertFileNotExists("$directory/$archiveFile");
    }
}
