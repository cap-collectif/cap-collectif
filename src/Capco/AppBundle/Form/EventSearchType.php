<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\ConsultationRepository;
use Capco\AppBundle\Toggle\Manager;

class EventSearchType extends AbstractType
{
    private $toggleManager;

    function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'search', array(
                'required' => false,
                'label' => 'event.searchform.term',
                'translation_domain' => 'CapcoAppBundle',
            ))
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder
                ->add(
                    'theme',
                    'entity',
                    array(
                        'required' => false,
                        'class' => 'CapcoAppBundle:Theme',
                        'property' => 'title',
                        'label' => 'event.searchform.theme',
                        'translation_domain' => 'CapcoAppBundle',
                        'query_builder' => function (ThemeRepository $tr) {
                            return $tr->createQueryBuilder('t')
                                ->where('t.isEnabled = :enabled')
                                ->setParameter('enabled', true);
                        },
                        'empty_value' => 'event.searchform.all_themes',
                        'attr' => array('onchange' => 'this.form.submit()')
                    )
                );
        }

        $builder->add('consultation', 'entity', array(
            'required' => false,
            'class' => 'CapcoAppBundle:Consultation',
            'property' => 'title',
            'label' => 'event.searchform.consultation',
            'translation_domain' => 'CapcoAppBundle',
            'query_builder' => function (ConsultationRepository $cr) {
                return $cr->createQueryBuilder('c')
                    ->where('c.isEnabled = :enabled')
                    ->setParameter('enabled', true);
            },
            'empty_value' => 'event.searchform.all_consultations',
            'attr' => array('onchange' => 'this.form.submit()')
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_event_search';
    }
}
