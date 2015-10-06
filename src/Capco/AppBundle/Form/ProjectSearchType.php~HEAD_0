<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Repository\ThemeRepository;

class ProjectSearchType extends AbstractType
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
            ->add('term', 'search', array(
                'required' => false,
                'label' => 'project.searchform.term',
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('sort', 'choice', array(
                'required' => false,
                'choices' => Project::$sortOrderLabels,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'project.searchform.sort',
                'empty_value' => false,
                'attr' => array('onchange' => 'this.form.submit()'),
            ))
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme', 'entity', array(
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'label' => 'project.searchform.theme',
                'translation_domain' => 'CapcoAppBundle',
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
                'empty_value' => 'project.searchform.all_themes',
                'attr' => array('onchange' => 'this.form.submit()'),
            ));
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search_project';
    }
}
