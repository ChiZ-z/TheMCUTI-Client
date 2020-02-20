import { Component, OnInit, Input } from '@angular/core';
import { SearchItem, Constants, EnumHelper } from 'src/app/core';
import { Router } from '@angular/router';
import { toUnicode, toASCII } from 'punycode';


@Component({
    selector: 'tmc-search-card',
    templateUrl: './search-card.component.html',
    styleUrls: ['./search-card.component.css']
})
export class SearchCardComponent implements OnInit {

    private enum: EnumHelper;

    private arrayToGlow: string[];
    private salt: string = '';

    @Input() searchItem: SearchItem;
    @Input() searchValue: string;

    constructor(private router: Router) {
        this.enum = new EnumHelper();
    }

    ngOnInit() {
        let text: string = '';
        let bufferText: string = '';
        this.salt = btoa(toASCII(this.searchValue) + 'saltty' + Math.random() * 1000);
        if (this.searchItem.category == Constants.TERMS) {
            bufferText = this.searchItem.term;
            text = this.markText(this.searchItem.term);
        }
        if (this.searchItem.category == Constants.TRANSLATIONS) {
            bufferText = this.searchItem.translation;
            text = this.markText(this.searchItem.translation);
        }
        this.arrayToGlow = text.split(this.salt);
        this.fixArray(bufferText);
    }

    fixArray(text: string) {
        let tempString: string = text;
        const reg = new RegExp(this.searchValue, 'ig');
        this.arrayToGlow.forEach(elem => {
            if (reg.test(elem)) {
                const currentReg = new RegExp(elem, 'ig');
                let str: string = currentReg.exec(tempString).toString();
                this.arrayToGlow[this.arrayToGlow.indexOf(elem)] = str;
                tempString = tempString.replace(str, '');
            }
        });
    }

    getLinkTitle() {
        if (this.searchItem.category == Constants.TERMS) {
            return 'label.go.to.terms.page';
        }
        if (this.searchItem.category == Constants.TRANSLATIONS) {
            return 'label.go.to.translations.page';
        }
    }

    getBorder() {
        if (this.searchItem.category == Constants.TERMS) {
            return 'terms-border';
        }
        if (this.searchItem.category == Constants.TRANSLATIONS) {
            return 'translations-border';
        }
    }

    markText(text: string) {
        let txt: string = text;
        return txt.replace(new RegExp(this.searchValue, 'ig'), this.salt + this.searchValue + this.salt);
    }

    goToLink() {
        if (this.searchItem.category == Constants.TERMS) {
            this.router.navigateByUrl('/projects/' + this.searchItem.projectId + '/terms?page=1&search=' + this.searchValue);
        }
        if (this.searchItem.category == Constants.TRANSLATIONS) {
            this.router.navigateByUrl('/projects/' + this.searchItem.projectId + '/langs/' + this.searchItem.projectLangId + '?page=1&search=' + this.searchValue);
        }
    }

    checkStringToGlow(str: string) {
        const reg = new RegExp(this.searchValue, 'ig');
        return reg.test(str);
    }
}