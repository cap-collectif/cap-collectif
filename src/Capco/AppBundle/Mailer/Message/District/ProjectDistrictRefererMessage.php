<?php

namespace Capco\AppBundle\Mailer\Message\District;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProjectDistrictRefererMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'new-project-in-district';
    public const TEMPLATE = '@CapcoMail/District/new-project-in-district.html.twig';

    public static function getMyTemplateVars(Project $project, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
            'projectTitle' => $params['projectTitle'],
            'projectThumb' => $params['projectThumb'],
            'projectsURL' => $params['projectsURL'],
            'zoneGeoTitle' => $params['zoneGeoTitle'],
            'logoUrl' => $params['logoUrl'],
            'baseUrl' => $params['baseURL'],
            'siteUrl' => $params['siteUrl'],
        ];
    }

    public static function getMySubjectVars(Project $project, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
        ];
    }

    public static function mockData(): array
    {
        return [
            'logoUrl' =>
                'https://capco.dev/media/cache/default_logo/default/0001/01/providerReferenceForLogo.png',
            'siteName' => 'Capco',
            'siteUrl' => 'https://capco.dev',
            'baseUrl' => 'https://capco.dev',
            'projectsURL' => 'https://capco.dev',
            'user_locale' => 'fr-FR',
            'projectTitle' => 'Food project',
            'projectThumb' => null,
            'zoneGeoTitle' => 'District 9.',
        ];
    }
}
