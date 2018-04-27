<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $choices = $this->generateChoices();

        $builder
            ->add('term',
                TextType::class, [
                'required' => false,
                'label' => 'search.form.label.term',
                'translation_domain' => 'CapcoAppBundle',
                'attr' => ['placeholder' => 'search.form.placeholder.term'],
            ])
            ->add('type',
                ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'expanded' => true,
                'choices' => $choices,
            ])
            ->add('sort',
                ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'choices' => [
                    'score' => 'search.form.sort.score',
                    'date' => 'search.form.sort.date',
                ],
                'attr' => ['onchange' => 'this.form.submit()'],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    private function generateChoices()
    {
        $choices = [
            'all' => 'search.form.types.all',
            'proposal' => 'search.form.types.proposals',
            'comment' => 'search.form.types.comments',
            'argument' => 'search.form.types.arguments',
            'project' => 'search.form.types.projects',
            'opinion' => 'search.form.types.opinions',
            'source' => 'search.form.types.sources',
        ];

        if ($this->toggleManager->isActive('versions')) {
            $choices['opinionVersion'] = 'search.form.types.versions';
        }
        if ($this->toggleManager->isActive('blog')) {
            $choices['post'] = 'search.form.types.posts';
        }
        if ($this->toggleManager->isActive('calendar')) {
            $choices['event'] = 'search.form.types.events';
        }
        if ($this->toggleManager->isActive('themes')) {
            $choices['theme'] = 'search.form.types.themes';
        }

        $choices['user'] = 'search.form.types.users';

        return $choices;
    }
}
