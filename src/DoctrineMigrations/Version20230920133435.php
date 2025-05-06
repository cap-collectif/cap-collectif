<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

final class Version20230920133435 extends AbstractMigration implements ContainerAwareInterface
{
    private const PARAMETER = 'cookies-list';
    private TranslatorInterface $translator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->translator = $container->get('translator');
    }

    public function getDescription(): string
    {
        return 'Removes the cloudflare cfduid cookie from the cookies list and updates the translation';
    }

    public function up(Schema $schema): void
    {
        // Remove the cfduid cookie from the cookies list
        $cookiesList = $this->getCookiesList();

        if (null !== $cookiesList) {
            $updatedCookiesList = str_replace('<tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>__cfduid</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par le réseau de contenu Cloudflare, pour identifier le trafic web fiable.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>12 mois</p></td></tr>', '', $cookiesList);

            $this->addSql('UPDATE site_parameter SET value = :updatedCookiesList WHERE keyname = :keyname', [
                'updatedCookiesList' => $updatedCookiesList,
                'keyname' => self::PARAMETER,
            ]);
        }

        // Updates the translations
        $allLocales = $this->getLocales();

        if ($this->getParameterId(self::PARAMETER)) {
            foreach ($allLocales as $locale) {
                $translatedCookiesList = $this->translator->trans('site-parameter.cookies-list', [], 'CapcoAppBundle', $locale);
                $updatedTranslatedCookiesList = preg_replace('/<tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>__cfduid<\/p><\/td>.*<\/tr>/', '', $translatedCookiesList);

                $this->addSql(
                    'UPDATE site_parameter_translation SET value = :updatedTranslatedCookiesList WHERE locale = :locale AND translatable_id = :translatable_id',
                    [
                        'updatedTranslatedCookiesList' => $updatedTranslatedCookiesList,
                        'locale' => $locale,
                        'translatable_id' => $this->getParameterId(self::PARAMETER),
                    ]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        $oldCookiesList = '<h3>Cookies internes nécessaires au site pour fonctionner </h3><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité</strong></p></th><th style="border:solid 1px black;" style="border:solid;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>PHPSESSID</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Cap-collectif pour garantir la session de l&acute;utilisateur</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Session</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>__cfduid</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par le réseau de contenu Cloudflare, pour identifier le trafic web fiable.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>12 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>hasFullConsent</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Cap-collectif  pour sauvegarder les choix de consentement des cookies tiers.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr></tbody></table><h3>Cookies de mesure d&acute; audience</h3><p>Les outils de mesures d&acute;audience sont déployés afin d&acute;obtenir des informations sur la navigation des visiteurs. Ils permettent notamment de comprendre comment les utilisateurs arrivent sur un site et de reconstituer leur parcours.</p><p>URL du site utilise l&acute; outil de mesure d&acute; audience <a href="https://www.google.com/url?q=https://www.google.fr/analytics/terms/fr.html&sa=D&ust=1555580197522000">Google Analytics</a>.</p><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_ga</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Enregistre un identifiant unique utilisé pour générer des données statistiques sur la façon dont le visiteur utilise le site.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_gat</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Ce cookie est utilisé pour surveiller le taux de requêtes vers les serveurs de Google Analytics.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>10 mn</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>_gid</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Ce cookie stocke et met à jour une valeur unique pour chaque page visitée.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>24h</p></td></tr></tbody></table><h3>Cookies de communication personnalisée</h3><p>Les cookies de communication personnalisée sont utilisés pour effectuer le suivi des visiteurs et ainsi proposer les messages de communication de la plateforme  sur les autres sites internet et/ou applications qu&acute;ils consultent.</p><p>URL du site utilise l‘outil <a href="https://www.google.com/url?q=https://marketingplatform.google.com/intl/fr_ALL/about/&sa=D&ust=1555580197525000">Google Marketing Platform</a>.</p><table><thead><tr style="text-align:center;"><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Nom du cookie</strong></p></th><th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Finalité<strong></p> </th> <th style="border:solid 1px black;" colspan="1" rowspan="1"><p><strong>Durée de conservation</strong></p></th></tr></thead><tbody><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>IDE</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par Google Marketing Platform pour enregistrer et signaler les actions de l&acute; utilisateur du site après qu&acute; il ait vu ou cliqué sur un message de communication de la plateforme afin de mesurer l&acute; efficacité et présenter des messages de communication adaptés à l&acute; utilisateur.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr><tr><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>DSID</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>Utilisé par  Google Marketing Platform  afin de suivre votre activité multi-appareils.</p></td><td style="border:solid 1px black;" colspan="1" rowspan="1"><p>13 mois</p></td></tr></tbody></table>';

        $this->addSql('UPDATE site_parameter SET value = :oldCookiesList WHERE keyname = :keyname', [
            'oldCookiesList' => $oldCookiesList,
            'keyname' => 'cookies-list',
        ]);
    }

    private function getLocales(): array
    {
        $query = $this->connection->executeQuery('SELECT code FROM locale');
        $locales = [];
        while ($code = $query->fetchOne(0)) {
            $locales[] = $code;
        }

        return $locales;
    }

    private function getParameterId(string $parameterKey): ?string
    {
        $id = $this->connection->fetchOne(
            "SELECT id FROM site_parameter WHERE keyname = '{$parameterKey}'"
        );
        if (!$id) {
            return null;
        }

        return $id;
    }

    private function getCookiesList(): ?string
    {
        $cookiesList = $this->connection->fetchOne(
            "SELECT value FROM site_parameter WHERE keyname = 'cookies-list'"
        );
        if (!$cookiesList) {
            return null;
        }

        return $cookiesList;
    }
}
