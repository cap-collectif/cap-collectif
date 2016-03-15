<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class PostSearchType extends AbstractType
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
        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme', 'entity', [
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'label' => 'blog.searchform.theme',
                'translation_domain' => 'CapcoAppBundle',
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
                'empty_value' => 'blog.searchform.all_themes',
                'attr' => ['onchange' => 'this.form.submit()'],
            ]);
        }

        $builder->add('project', 'entity', [
            'required' => false,
            'class' => 'CapcoAppBundle:Project',
            'property' => 'title',
            'label' => 'blog.searchform.project',
            'translation_domain' => 'CapcoAppBundle',
            'query_builder' => function (ProjectRepository $cr) {
                return $cr->createQueryBuilder('c')
                    ->where('c.isEnabled = :enabled')
                    ->setParameter('enabled', true);
            },
            'empty_value' => 'blog.searchform.all_projects',
            'attr' => ['onchange' => 'this.form.submit()'],
        ]);
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search_blog';
    }
}
