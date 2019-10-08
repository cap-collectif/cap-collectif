<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Finder\Finder;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191007104542 extends AbstractMigration implements ContainerAwareInterface
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
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE category_image (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', image_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_2D0E4B163DA5256D (image_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE category_image ADD CONSTRAINT FK_2D0E4B163DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_category ADD category_media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE proposal_category ADD CONSTRAINT FK_E71725E95DE5590E FOREIGN KEY (category_media_id) REFERENCES category_image (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_E71725E95DE5590E ON proposal_category (category_media_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_category DROP FOREIGN KEY FK_E71725E95DE5590E');
        $this->addSql('DROP TABLE category_image');
        $this->addSql('DROP INDEX IDX_E71725E95DE5590E ON proposal_category');
        $this->addSql('ALTER TABLE proposal_category DROP category_media_id');
    }

    public function postUp(Schema $schema)
    {
        $classificationCategories = $this->connection->fetchAll('SELECT id from classification__category where id = 2');
        if (empty($classificationCategories)) {
            return;
        }

        $finder = new Finder();
        $categoryImages =
            $this->container->getParameter('kernel.root_dir').
            '/../src/Capco/AppBundle/DataFixtures/files/categoryImage/';

        $finder->files()->in($categoryImages);
        $now = new \DateTime();
        foreach ($finder as $file) {
            $absoluteFilePath = $file->getRealPath();
            $media = [
                'id' => $this->generator->generate($this->em, null),
                'category_id' => 2,
                'name' => str_replace('.'.$file->getExtension(), '', $file->getBasename()),
                'provider_name' => 'sonata.media.provider.image',
                'provider_reference' => $file->getBasename(),
                'provider_metadata' => json_encode(['filename' => $file->getBasename()]),
                'content_type' => mime_content_type($absoluteFilePath),
                'content_size' => $file->getSize(),
                'context' => 'default',
                'enabled' => true,
                'updated_at' => $now->format('Y-m-d H:i:s'),
                'created_at' => $now->format('Y-m-d H:i:s'),
            ];

            $this->connection->insert('media__media', $media);
        }
    }
}
