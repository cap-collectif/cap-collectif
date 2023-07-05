<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180122115338 extends AbstractMigration
{
    protected $siteImages = [
        [
            'keyname' => 'homepage.picto',
            'category' => 'pages.homepage',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 3,
        ],
        [
            'keyname' => 'blog.picto',
            'category' => 'pages.blog',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 6,
        ],
        [
            'keyname' => 'events.picto',
            'category' => 'pages.events',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 7,
        ],
        [
            'keyname' => 'ideas.picto',
            'category' => 'pages.ideas',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 8,
        ],
        [
            'keyname' => 'themes.picto',
            'category' => 'pages.themes',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 9,
        ],
        [
            'keyname' => 'projects.picto',
            'category' => 'pages.projects',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 10,
        ],
        [
            'keyname' => 'members.picto',
            'category' => 'pages.members',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 11,
        ],
        [
            'keyname' => 'contact.picto',
            'category' => 'pages.contact',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 12,
        ],
        [
            'keyname' => 'ideas_trash.picto',
            'category' => 'pages.ideas_trash',
            'is_social_network_thumbnail' => 1,
            'is_enabled' => 0,
            'position' => 13,
        ],
    ];
    protected $siteParameters = [
        [
            'keyname' => 'homepage.metadescription',
            'category' => 'pages.homepage',
            'value' => "Participez à l'élaboration de la loi",
            'position' => 101,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'event.metadescription',
            'category' => 'pages.events',
            'value' => '',
            'position' => 304,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'ideas.metadescription',
            'category' => 'pages.ideas',
            'value' => '',
            'position' => 422,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'blog.metadescription',
            'category' => 'pages.blog',
            'value' => '',
            'position' => 790,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'themes.metadescription',
            'category' => 'pages.themes',
            'value' => '',
            'position' => 521,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'projects.metadescription',
            'category' => 'pages.projects',
            'value' => '',
            'position' => 321,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'members.metadescription',
            'category' => 'pages.members',
            'value' => '',
            'position' => 783,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'contact.metadescription',
            'category' => 'pages.contact',
            'value' => '',
            'position' => 621,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
        [
            'keyname' => 'ideas_trash.metadescription',
            'category' => 'pages.ideas_trash',
            'value' => '',
            'position' => 441,
            'is_social_network_description' => 1,
            'type' => 0,
        ],
    ];
    protected $siteCustomCodes = [
        [
            'keyname' => 'ideas.customcode',
            'category' => 'pages.ideas',
            'value' => '',
            'position' => 6,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'homepage.customcode',
            'category' => 'pages.homepage',
            'value' => '',
            'position' => 102,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'event.customcode',
            'category' => 'pages.events',
            'value' => '',
            'position' => 305,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'blog.customcode',
            'category' => 'pages.blog',
            'value' => '',
            'position' => 791,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'themes.customcode',
            'category' => 'pages.themes',
            'value' => '',
            'position' => 522,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'projects.customcode',
            'category' => 'pages.projects',
            'value' => '',
            'position' => 322,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'members.customcode',
            'category' => 'pages.members',
            'value' => '',
            'position' => 794,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'contact.customcode',
            'category' => 'pages.contact',
            'value' => '',
            'position' => 622,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
        [
            'keyname' => 'ideas_trash.customcode',
            'category' => 'pages.ideas_trash',
            'value' => '',
            'position' => 442,
            'type' => 3,
            'is_social_network_description' => 0,
        ],
    ];

    public function postUp(Schema $schema): void
    {
        $defaultValues = [
            'is_enabled' => 1,
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'updated_at' => (new \DateTime())->format('Y-m-d H:i:s'),
        ];
        foreach ($this->siteImages as $siteImage) {
            $this->connection->insert('site_image', array_merge($siteImage, $defaultValues));
            $id = $this->connection->lastInsertId();
            $this->write('-> Added ' . $siteImage['keyname'] . ' thumbnails to site_image');
        }
        foreach ($this->siteParameters as $siteParameter) {
            $this->connection->insert(
                'site_parameter',
                array_merge($siteParameter, $defaultValues)
            );
            $id = $this->connection->lastInsertId();
            $this->write('-> Added ' . $siteParameter['keyname'] . ' settings to site_parameter');
        }
        foreach ($this->siteCustomCodes as $siteCustomCode) {
            $this->connection->insert(
                'site_parameter',
                array_merge($siteCustomCode, $defaultValues)
            );
            $id = $this->connection->lastInsertId();
            $this->write(
                '-> Added ' . $siteCustomCode['keyname'] . ' custom code to site_parameter'
            );
        }
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->siteImages as $siteImage) {
            foreach ($siteImage as $property => $value) {
                if ('keyname' === $property) {
                    $this->connection->delete('site_image', ['keyname' => $value]);

                    break;
                }
            }
            $this->write('-> Removed ' . $siteImage['keyname'] . ' from site_image ');
        }
        foreach ($this->siteParameters as $siteParameter) {
            foreach ($siteParameter as $property => $value) {
                if ('keyname' === $property) {
                    $this->connection->delete('site_parameter', ['keyname' => $value]);

                    break;
                }
            }
            $this->write('-> Removed ' . $siteParameter['keyname'] . ' from site_parameter ');
        }
        foreach ($this->siteCustomCodes as $siteCustomCode) {
            foreach ($siteCustomCode as $property => $value) {
                if ('keyname' === $property) {
                    $this->connection->delete('site_parameter', ['keyname' => $value]);

                    break;
                }
            }
            $this->write('-> Removed ' . $siteCustomCode['keyname'] . ' from site_parameter ');
        }
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }
}
