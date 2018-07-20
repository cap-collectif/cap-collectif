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
            ->add('term', TextType::class, [
                'required' => false,
                'label' => 'search.form.label.term',
                'translation_domain' => 'CapcoAppBundle',
                'attr' => ['placeholder' => 'search.form.placeholder.term'],
            ])
            ->add('type', ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'expanded' => true,
                'choices' => $choices,
            ])
            ->add('sort', ChoiceType::class, [
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'placeholder' => false,
                'choices' => [
                    'search.form.sort.score' => 'score',
                    'search.form.sort.date' => 'date',
                ],
                'attr' => ['onchange' => 'this.form.submit()'],
            ]);
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
            'search.form.types.all' => 'all',
            'search.form.types.proposals' => 'proposal',
            'search.form.types.comments' => 'comment',
            'search.form.types.arguments' => 'argument',
            'search.form.types.projects' => 'project',
            'search.form.types.opinions' => 'opinion',
            'search.form.types.sources' => 'source',
        ];

        if ($this->toggleManager->isActive('versions')) {
            $choices['search.form.types.versions'] = 'opinionVersion';
        }
        if ($this->toggleManager->isActive('blog')) {
            $choices['search.form.types.posts'] = 'post';
        }
        if ($this->toggleManager->isActive('calendar')) {
            $choices['search.form.types.events'] = 'event';
        }
        if ($this->toggleManager->isActive('themes')) {
            $choices['search.form.types.themes'] = 'theme';
        }

        $choices['search.form.types.users'] = 'user';

        return $choices;
    }
}
