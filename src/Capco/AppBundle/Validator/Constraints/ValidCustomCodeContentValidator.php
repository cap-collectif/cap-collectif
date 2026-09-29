<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidCustomCodeContentValidator extends ConstraintValidator
{
    private const ROOT_TAGS_ALLOWED = ['style', 'script', 'noscript'];

    public function validate($content, Constraint $constraint): void
    {
        if (null === $content || '' === trim((string) $content)) {
            return;
        }

        $previous = libxml_use_internal_errors(true);
        $document = new \DOMDocument();
        $loaded = $document->loadHTML(
            '<!DOCTYPE html><html><body>' . $content . '</body></html>',
            \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (!$loaded) {
            $this->addViolation($constraint);

            return;
        }

        $html = $document->documentElement;
        $bodies = $document->getElementsByTagName('body');
        $body = $bodies->item(0);
        if (
            !$html instanceof \DOMElement
            || 'html' !== $html->tagName
            || 1 !== $document->getElementsByTagName('html')->length
            || 1 !== $bodies->length
            || !$body instanceof \DOMElement
            || $body->parentNode !== $html
        ) {
            $this->addViolation($constraint);

            return;
        }

        // libxml may move nodes outside the first body when repairing malformed HTML.
        foreach ([$document, $html] as $parent) {
            foreach ($parent->childNodes as $node) {
                if (
                    $node === $html || $node === $body
                    || $node instanceof \DOMDocumentType
                    || $node instanceof \DOMComment
                    || ($node instanceof \DOMText && '' === trim($node->textContent))
                ) {
                    continue;
                }

                $this->addViolation($constraint);

                return;
            }
        }

        foreach ($body->childNodes as $node) {
            if ($node instanceof \DOMText && '' === trim($node->textContent)) {
                continue;
            }

            if ($node instanceof \DOMComment) {
                continue;
            }

            if (!$node instanceof \DOMElement) {
                $this->addViolation($constraint);

                return;
            }

            if (!\in_array(strtolower($node->tagName), self::ROOT_TAGS_ALLOWED, true)) {
                $this->addViolation($constraint);

                return;
            }
        }
    }

    private function addViolation(Constraint $constraint): void
    {
        $this->context->buildViolation($constraint->message)->addViolation();
    }
}
