<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190911093327 extends AbstractMigration implements ContainerAwareInterface
{
    private $translator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->translator = $container->get('translator');
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql(
            'UPDATE contact_form SET confidentiality = concat(:JPEC, interlocutor, :JPEC2) WHERE interlocutor IS NOT NULL AND interlocutor <> \'\'',
            [
                'JPEC' => $this->translator->trans(
                    'information-for-the-contact-form-1',
                    [],
                    'SonataUserBundle'
                ),
                'JPEC2' => $this->translator->trans(
                    'information-for-the-contact-form-2',
                    [],
                    'SonataUserBundle'
                )
            ],
            [ParameterType::STRING, ParameterType::STRING]
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql(
            'UPDATE contact_form SET confidentiality = NULL WHERE interlocutor IS NOT NULL AND interlocutor <> \'\''
        );
    }
}
