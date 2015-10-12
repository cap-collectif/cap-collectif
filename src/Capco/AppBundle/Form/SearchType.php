<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraints\NotBlank;

class SearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    private function generateChoices()
    {
        $choices = [
            'all' => 'search.form.types.all',
            'comment' => 'search.form.types.comments',
            'argument' => 'search.form.types.arguments',
            'consultation' => 'search.form.types.consultations',
            'opinion' => 'search.form.types.opinions',
            'source' => 'search.form.types.sources',
        ];

        if ($this->toggleManager->isActive('versions')) {
            $choices['opinionVersion'] = 'search.form.types.versions';
        }

        if ($this->toggleManager->isActive('ideas')) {
            $choices['idea'] = 'search.form.types.ideas';
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

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $choices = $this->generateChoices();

        $builder
            ->add('term', 'text', [
                'required' => true,
                'label' => 'search.form.label.term',
                'translation_domain' => 'CapcoAppBundle',
                'constraints' => [new NotBlank(['message' => 'search.no_term'])],
                'attr' => ['placeholder' => 'search.form.placeholder.term'],
            ])
            ->add('type', 'choice', array(
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'empty_value' => false,
                'expanded' => true,
                'choices' => $choices,
            ))
            ->add('sort', 'choice', array(
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'empty_value' => false,
                'choices' => [
                    'score' => 'search.form.sort.score',
                    'date' => 'search.form.sort.date',
                ],
                'attr' => array('onchange' => 'this.form.submit()'),
            ))
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search';
    }
}
