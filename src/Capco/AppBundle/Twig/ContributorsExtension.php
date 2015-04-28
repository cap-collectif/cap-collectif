<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Resolver\ContributionResolver;

class ContributorsExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(ContributionResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_contributions';
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('capco_count_consultation_contributors', array($this, 'countConsultationContributors')),
        );
    }

    public function countConsultationContributors(Consultation $consultation)
    {
        return $this->resolver->countConsultationContributors($consultation);
    }
}
