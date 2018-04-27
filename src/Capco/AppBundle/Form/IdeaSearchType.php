<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\SearchType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class IdeaSearchType extends AbstractType
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
            ->add('term',
                SearchType::class, [
                'required' => false,
                'label' => 'idea.searchform.term',
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('sort',
                ChoiceType::class, [
                'required' => false,
                'choices' => Idea::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'idea.searchform.sort',
                'placeholder' => false,
                'attr' => ['onchange' => 'this.form.submit()'],
            ])
        ;

        if ($this->toggleManager->isActive('themes')) {
            $builder->add('theme',
                EntityType::class, [
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'label' => 'idea.searchform.theme',
                'translation_domain' => 'CapcoAppBundle',
                'query_builder' => function (ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
                'empty_value' => 'idea.searchform.all_themes',
                'attr' => ['onchange' => 'this.form.submit()'],
            ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }
}
