<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190212115338 extends AbstractMigration
{
    public function postUp(Schema $schema): void
    {
        $cookiesList = $this->connection->fetchAll(
            'SELECT id FROM site_parameter where keyname = "cookies-list"'
        );
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        if (0 === \count($cookiesList)) {
            $this->connection->insert('site_parameter', [
                'keyname' => 'cookies-list',
                'value' => '<h3>Cookies internes nécessaires au site pour fonctionner </h3><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité</strong></p></th><th style="border:solid 1px black;" style="border:solid;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>PHPSESSID</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Cap-collectif pour garantir la session de l&acute;utilisateur</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Session</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>__cfduid</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par le réseau de contenu Cloudflare, pour identifier le trafic web fiable.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>12 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>hasFullConsent</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Cap-collectif  pour sauvegarder les choix de consentement des cookies tiers.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr></tbody></table><h3>Cookies de mesure d&acute; audience</h3><p>Les outils de mesures d&acute;audience sont déployés afin d&acute;obtenir des informations sur la navigation des visiteurs. Ils permettent notamment de comprendre comment les utilisateurs arrivent sur un site et de reconstituer leur parcours.</p><p>URL du site utilise l&acute; outil de mesure d&acute; audience <a href="https://www.google.com/url?q=https://www.google.fr/analytics/terms/fr.html&sa=D&ust=1555580197522000">Google Analytics</a>.</p><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_ga</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Enregistre un identifiant unique utilisé pour générer des données statistiques sur la façon dont le visiteur utilise le site.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_gat</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Ce cookie est utilisé pour surveiller le taux de requêtes vers les serveurs de Google Analytics.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>10 mn</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_gid</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Ce cookie stocke et met à jour une valeur unique pour chaque page visitée.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>24h</p></td></tr></tbody></table><h3>Cookies de communication personnalisée</h3><p>Les cookies de communication personnalisée sont utilisés pour effectuer le suivi des visiteurs et ainsi proposer les messages de communication de la plateforme  sur les autres sites internet et/ou applications qu&acute;ils consultent.</p><p>URL du site utilise l‘outil <a href="https://www.google.com/url?q=https://marketingplatform.google.com/intl/fr_ALL/about/&sa=D&ust=1555580197525000">Google Marketing Platform</a>.</p><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité<strong></p> </th> <th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>IDE</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Google Marketing Platform pour enregistrer et signaler les actions de l&acute; utilisateur du site après qu&acute; il ait vu ou cliqué sur un message de communication de la plateforme afin de mesurer l&acute; efficacité et présenter des messages de communication adaptés à l&acute; utilisateur.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>DSID</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par  Google Marketing Platform  afin de suivre votre activité multi-appareils.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr></tbody></table>',
                'category' => 'pages.cookies',
                'position' => 3,
                'type' => 1,
                'is_enabled' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        } else {
            $this->connection->update(
                'site_parameter',
                [
                    'category' => 'pages.cookies',
                    'position' => 3,
                    'type' => 1
                ],
                $cookiesList['id']
            );
        }
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }
}
