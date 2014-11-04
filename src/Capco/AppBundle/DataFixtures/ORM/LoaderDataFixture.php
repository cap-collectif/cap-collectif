<?php

namespace Acme\DemoBundle\DataFixtures\ORM;

use Hautelook\AliceBundle\Alice\DataFixtureLoader;
use Nelmio\Alice\Fixtures;
use Model\Media;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class LoaderDataFixture extends DataFixtureLoader
{
    /**
     * {@inheritDoc}
     */
    protected function getFixtures()
    {
        return array(
            __DIR__ . '/Categories.yml',
//            __DIR__ . '/Media.yml',
            __DIR__ . '/Inbox.yml',
            __DIR__ . '/Users.yml',
            __DIR__ . '/Types.yml',
            __DIR__ . '/Consultations.yml',
            __DIR__ . '/Themes.yml',
            __DIR__ . '/Avis.yml',
            __DIR__ . '/Sources.yml',
        );
    }


    /**
     * Fixtures Upload file
     * @param $fileName
     * @return UploadedFile
     */
    public function createMedia($fileName)
    {
        $media = new Media();
        $file = new UploadedFile($media->getFixturesPath() . $fileName, $fileName, null, null, null, true);
        return $file;

    }
}
