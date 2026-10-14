<?php

namespace Capco\Tests\Provider;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Gaufrette\Adapter\Local;
use Gaufrette\Filesystem;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Filesystem\Filesystem as LocalFilesystem;
use Symfony\Component\HttpFoundation\File\File;

/**
 * @internal
 * @coversNothing
 */
class PrivateVoiceMessageTest extends TestCase
{
    public function testVoiceIsStoredOutsidePublicMediaAndCannotUsePublicReader(): void
    {
        $root = sys_get_temp_dir() . '/private-voice-' . bin2hex(random_bytes(8));
        $files = new LocalFilesystem();
        $files->mkdir($root . '/public/media');
        $files->dumpFile($root . '/upload', 'private recording');

        try {
            $provider = new MediaProvider(new Filesystem(new Local($root . '/public/media')), $this->createStub(CacheManager::class), $root);
            $media = (new Media())->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT)->setProviderReference('test.webm')->setBinaryContent(new File($root . '/upload'));
            $provider->writeBinaryContentInFile($media);
            self::assertSame('private recording', file_get_contents($root . '/var/vocal-contributions/test.webm'));
            self::assertFileDoesNotExist($root . '/public/media/' . Media::VOCAL_CONTRIBUTION_CONTEXT . '/0001/01/test.webm');
            self::assertNull($media->getBinaryContent());

            $publicMedia = (new Media())->setContext('default')->setProviderReference('test.txt')->setBinaryContent(new File($root . '/upload'));
            $provider->writeBinaryContentInFile($publicMedia);
            self::assertSame('private recording', $provider->getOrGenerateReferenceFile($publicMedia)->getContent());

            $this->expectException(\LogicException::class);
            $provider->getOrGenerateReferenceFile($media);
        } finally {
            $files->remove($root);
        }
    }

    public function testFailedVoiceCopyRemovesThePrivateFile(): void
    {
        $root = sys_get_temp_dir() . '/private-voice-' . bin2hex(random_bytes(8));
        $files = new LocalFilesystem();
        $files->mkdir($root . '/public/media');
        $files->mkdir($root . '/var/vocal-contributions');
        $files->dumpFile($root . '/upload', 'private recording');
        $source = new File($root . '/upload');
        $files->remove($root . '/upload');
        $files->dumpFile($root . '/var/vocal-contributions/test.webm', 'partial recording');

        try {
            $provider = new MediaProvider(new Filesystem(new Local($root . '/public/media')), $this->createStub(CacheManager::class), $root);
            $media = (new Media())
                ->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT)
                ->setProviderReference('test.webm')
                ->setBinaryContent($source)
            ;

            $copyFailed = false;

            try {
                $provider->writeBinaryContentInFile($media);
            } catch (\Throwable) {
                $copyFailed = true;
            }

            self::assertTrue($copyFailed);
            self::assertFileDoesNotExist($root . '/var/vocal-contributions/test.webm');
        } finally {
            $files->remove($root);
        }
    }
}
