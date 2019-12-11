<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Process\Process;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191031123246 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $medias = $this->container->get(MediaRepository::class)->getAllDefaultCategoryImages();
        /** @var Media $media */
        foreach ($medias as $media) {
            if (
                file_exists('/var/www/web/media/default/0001/01/' . $media->getProviderReference())
            ) {
                break;
            }

            (new Process(
                'cp  fixtures/files/categoryImage/' .
                    $media->getProviderReference() .
                    ' /var/www/web/media/default/0001/01/' .
                    $media->getProviderReference()
            ))->mustRun();
            // Let's generate cache for all medias in all formats, to avoid "/resolve" in first URL generation
            $imgFormats = ['default_logo', 'default_avatar', 'default_project'];
            foreach ($imgFormats as $format) {
                // Will generate cache file
                $this->container
                    ->get('liip_imagine.service.filter')
                    ->getUrlOfFilteredImage(
                        'default/0001/01/' . $media->getProviderReference(),
                        $format
                    );
            }
        }
    }
}
