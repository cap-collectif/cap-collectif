<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Toggle\Manager;

class EventSearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'search', [
                'required' => false,
                'label' => 'event.searchform.term',
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder
                ->add(
                    'theme',
                    'entity',
                    [
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
                        'attr' => ['onchange' => 'this.form.submit()'],
                    ]
                );
        }

        $builder->add('project', 'entity', [
            'required' => false,
            'class' => 'CapcoAppBundle:Project',
            'property' => 'title',
            'label' => 'event.searchform.project',
            'translation_domain' => 'CapcoAppBundle',
            'query_builder' => function (ProjectRepository $cr) {
                return $cr->createQueryBuilder('c')
                    ->where('c.isEnabled = :enabled')
                    ->setParameter('enabled', true);
            },
            'empty_value' => 'event.searchform.all_projects',
            'attr' => ['onchange' => 'this.form.submit()'],
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_event_search';
    }
}
