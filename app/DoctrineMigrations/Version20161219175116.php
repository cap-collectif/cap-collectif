<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\Id\UuidGenerator;

class Version20161219175116 extends AbstractMigration implements ContainerAwareInterface
{
    protected $em;
    protected $idToUuidMap = [];
    protected $generator;
    protected $fkTables = [
      'proposal',
      'user_favorite_proposal',
      'theme',
      'comment',
      'reporting',
      'answer',
      'opinion',
      'opinion_version',
      'idea',
      'argument',
      'source',
      'reply',
      'project',
      'event',
      'blog_post_authors',
      'event_registration',
      'synthesis_element',
      'video',
    ];

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine.orm.default_entity_manager');
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema)
    {
        /*$this->addSql('ALTER TABLE fos_user ADD author_uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        foreach ($this->fkTables as $table) {
          $this->addSql('ALTER TABLE '. $table .' ADD author_uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        }
        $this->addSql('ALTER TABLE proposal ADD update_author_uuid CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\'');
        */
    }

    public function generateUuids()
    {
      $users = $this->em->getRepository('CapcoUserBundle:User')->findAll();
      foreach ($users as $user) {
          echo "Creating uuid for user " . $user->getId() . '\n';
          $uuid = $this->generator->generate($this->em, null);
          $this->idToUuidMap[$user->getId()] = $uuid;
          $user->setUuid($uuid);
      }
      $this->em->flush();
    }

    public function setNewFKs()
    {
        $proposals = $this->em->getRepository('CapcoAppBundle:Proposal')->findAll();
        foreach ($proposals as $proposal) {
            $authorId = $proposal->getAuthor()->getId();
            $this->connection->update('proposal', [
                'author_uuid' => $this->idToUuidMap[$proposal->getAuthor()->getId()]
                // 'update_author_uuid' => $this->idToUuidMap[$proposal->getAuthor()->getId()
              ]),
              ['id' => $proposal->getId()]
              );
        }
        // $this->em->flush();
    }

    public function deleteOldFKs()
    {
      foreach ($this->fkTables as $table) {
        $this->executeSql('ALTER TABLE '. $table .' DELETE author_id');
      }
      // $this->addSql('ALTER TABLE proposal DELETE author_update_id ');
    }

    public function renameFKs()
    {
      foreach ($this->fkTables as $table) {
        $this->executeSql('ALTER TABLE '. $table .' RENAME author_uuid author_id');
      }
    }

    public function postUp(Schema $schema)
    {
      $this->generateUuids();
      $this->setNewFKs();
      $this->deleteOldFKs();
      $this->renameFKs();
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE fos_user DROP uuid');
    }
}
