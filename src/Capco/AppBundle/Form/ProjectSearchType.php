<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\SearchType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectSearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term',
                SearchType::class, [
                'required' => false,
            ])
            ->add('orderBy',
                ChoiceType::class, [
                    'required' => false,
                    'choices' => Project::$sortOrderLabels,
                    'placeholder' => false,
            ])
        ;

        $builder->add('type', EntityType::class, [
            'required' => false,
            'class' => \Capco\AppBundle\Entity\ProjectType::class,
            'choice_value' => 'slug',
        ]);

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme',
                EntityType::class, [
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'choice_value' => 'slug',
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
                'placeholder' => 'global.select_themes',
            ]);
        }

        $builder->add('page', IntegerType::class, ['required' => false]);

        if ($this->toggleManager->isActive('project_form')) {
            $builder->add('limit', IntegerType::class, ['required' => false]);
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }

    public function getBlockPrefix()
    {
        return '';
    }
}
