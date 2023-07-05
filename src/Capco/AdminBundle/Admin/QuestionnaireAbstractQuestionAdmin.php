<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class QuestionnaireAbstractQuestionAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->entityManager = $entityManager;
    }

    public function postRemove($object): void
    {
        // delete linked question
        if ($object->getQuestion()) {
            $this->entityManager->remove($object->getQuestion());
        }
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $questionnaireId = null;

        if ($this->hasParentFieldDescription()) {
            // this Admin is embedded
            $questionnaire = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
            ;
            if ($questionnaire) {
                $questionnaireId = $questionnaire->getId();
            }
        }

        $form
            ->add('position', null, [
                'label' => 'global.position',
                'required' => true,
            ])
            ->add(
                'question',
                ModelListType::class,
                [
                    'required' => true,
                    'label' => 'admin.fields.questionnaire_abstractquestion.questions',
                    'translation_domain' => 'CapcoAppBundle',
                    'btn_delete' => false,
                    'btn_add' => 'admin.fields.questionnaire_abstractquestion.questions_add',
                ],
                [
                    'link_parameters' => ['questionnaireId' => $questionnaireId],
                ]
            )
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }
}
